import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const privateDir = resolve('private-data')
const credentialsPath = resolve(privateDir, 'firebase-service-account.json')
const consultaPath = resolve(privateDir, 'ResultadoConsulta.csv')
const resultadoLocalPath = resolve(privateDir, 'resultado-local.csv')

const EVENT_DATE = new Date(Date.UTC(2026, 6, 4))
const MINIMUM_BIRTH_DATE = new Date(Date.UTC(2010, 0, 4))

const parseCsv = (content) => {
  const rows = []
  let cell = ''
  let row = []
  let quoted = false

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    const next = content[index + 1]

    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if ((char === ',' || char === ';') && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell)
      if (row.some((value) => value !== '')) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }

  const headers = rows.shift()?.map((header) => header.replace(/^\uFEFF/, '').trim()) ?? []
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ''])))
}

const csvCell = (value = '') => `"${String(value).replaceAll('"', '""')}"`

const writeCsv = async (path, headers, rows) => {
  await mkdir(privateDir, { recursive: true })
  const lines = rows.map((row) => headers.map((header) => csvCell(row[header])).join(','))
  await writeFile(path, `\uFEFF${headers.join(',')}\n${lines.join('\n')}\n`, 'utf8')
}

const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()

const onlyDigits = (value = '') => String(value).replace(/\D/g, '')

const formatCpf = (value = '') => {
  const digits = onlyDigits(value)
  return digits.length === 11 ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : value
}

const formatPhone = (value = '') => onlyDigits(value)

const parseBirthDate = (value = '') => {
  const text = String(value).trim()
  const br = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (br) return new Date(Date.UTC(Number(br[3]), Number(br[2]) - 1, Number(br[1])))
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])))
  return null
}

const toIsoDate = (birthDate) =>
  birthDate ? birthDate.toISOString().slice(0, 10) : ''

const ageOnEvent = (birthDate) => {
  let age = EVENT_DATE.getUTCFullYear() - birthDate.getUTCFullYear()
  const beforeBirthday =
    EVENT_DATE.getUTCMonth() < birthDate.getUTCMonth()
    || (EVENT_DATE.getUTCMonth() === birthDate.getUTCMonth() && EVENT_DATE.getUTCDate() < birthDate.getUTCDate())
  if (beforeBirthday) age -= 1
  return age
}

const meetsMinimumAge = (birthDate) => birthDate <= MINIMUM_BIRTH_DATE

const validCpf = (value = '') => {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || new Set(cpf).size === 1) return false

  const checkDigit = (length) => {
    const total = [...cpf.slice(0, length)].reduce((sum, number, index) => sum + Number(number) * (length + 1 - index), 0)
    const remainder = (total * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  return checkDigit(9) === Number(cpf[9]) && checkDigit(10) === Number(cpf[10])
}

const completeName = (value = '') =>
  String(value).trim().split(/\s+/).filter((part) => part.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'-]/g, '').length >= 2).length >= 2

const truthy = (value = '') => ['sim', 's', 'ok', 'true', '1', 'dados conferem'].includes(normalizeText(value))

const stableId = (cpf) => createHash('sha256').update(onlyDigits(cpf)).digest('hex').slice(0, 32)

const publicMessage = (status, reasons) => {
  if (status === 'aprovado') return 'Cadastro aprovado para a pré-lista.'
  if (status === 'pendente') return 'Cadastro recebido e ainda em análise.'
  if (reasons.includes('abaixo da idade minima na data da festa')) return 'Cadastro não aprovado pelos critérios da pré-lista.'
  return 'Cadastro em análise ou com pendência nos dados enviados.'
}

const normalizeConsultaRow = (row) => {
  const cpf = onlyDigits(row.cpf)
  const birthDate = parseBirthDate(row.nascimento)
  const age = birthDate ? ageOnEvent(birthDate) : null
  const nomeConferido = truthy(row.nome_confere)
  const cpfRegular = normalizeText(row.status_receita) === 'regular'
  const processado = !row.processado || truthy(row.processado)
  const reasons = []

  if (!completeName(row.nome)) reasons.push('nome incompleto')
  if (!validCpf(cpf)) reasons.push('cpf inválido')
  if (!birthDate) reasons.push('nascimento inválido')
  else if (!meetsMinimumAge(birthDate)) reasons.push('abaixo da idade minima na data da festa')
  if (!nomeConferido) reasons.push('nome não conferido')
  if (!cpfRegular) reasons.push('cpf não regular')
  if (!processado) reasons.push('consulta não processada')

  const status = !processado ? 'pendente' : reasons.length ? 'reprovado' : 'aprovado'

  return {
    cpf,
    nome: row.nome?.trim() || '',
    nascimento: row.nascimento?.trim() || '',
    nascimentoIso: toIsoDate(birthDate),
    telefone: formatPhone(row.telefone || row.whatsapp || ''),
    email: row.email?.trim().toLowerCase() || '',
    cpfFormatado: formatCpf(cpf),
    cpfFinal: cpf.slice(-4),
    idadeEm04072026: age ?? '',
    status,
    nomeConferido,
    cpfRegular,
    maioridadeNoEvento: Boolean(birthDate && meetsMinimumAge(birthDate)),
    processado,
    conferidoEm: row.conferido_em || '',
    observacoes: row.observacoes || '',
    motivos: reasons.join('; '),
  }
}

try {
  const credentials = JSON.parse(await readFile(credentialsPath, 'utf8'))
  initializeApp({ credential: cert(credentials) })

  const consultaRows = parseCsv(await readFile(consultaPath, 'utf8'))
  const normalized = consultaRows
    .map(normalizeConsultaRow)
    .filter((row) => row.cpf)

  const seen = new Set()
  const uniqueRows = []
  for (const row of normalized) {
    if (seen.has(row.cpf)) continue
    seen.add(row.cpf)
    uniqueRows.push(row)
  }

  const db = getFirestore()
  const publicRef = db.collection('preListaPublica')
  const existingPublic = await publicRef.get()

  let batch = db.batch()
  let operations = 0
  const commitIfNeeded = async () => {
    if (operations === 0) return
    await batch.commit()
    batch = db.batch()
    operations = 0
  }

  for (const document of existingPublic.docs) {
    batch.delete(document.ref)
    operations += 1
    if (operations >= 450) await commitIfNeeded()
  }

  const auditRows = []
  let updatedPrivate = 0
  let publishedPublic = 0
  let missingPrivate = 0

  for (const row of uniqueRows) {
    const privateDoc = await db.collection('preLista').doc(row.cpf).get()
    const isInPreList = privateDoc.exists

    if (isInPreList) {
      const privateUpdate = {
        nome: row.nome,
        nascimento: row.nascimentoIso,
        status: row.status,
        validacaoConsulta: {
          nomeConferido: row.nomeConferido,
          cpfRegular: row.cpfRegular,
          maioridadeNoEvento: row.maioridadeNoEvento,
          processado: row.processado,
          conferidoEm: row.conferidoEm,
          motivos: row.motivos,
          atualizadoEm: FieldValue.serverTimestamp(),
        },
        atualizadoEm: FieldValue.serverTimestamp(),
      }

      if (row.telefone) privateUpdate.telefone = row.telefone
      if (row.email) privateUpdate.email = row.email

      batch.update(privateDoc.ref, privateUpdate)
      operations += 1
      updatedPrivate += 1
    } else {
      missingPrivate += 1
    }

    if (isInPreList) {
      batch.set(publicRef.doc(stableId(row.cpf)), {
        nome: row.nome,
        cpfFinal: row.cpfFinal,
        status: row.status,
        maioridadeNoEvento: row.maioridadeNoEvento,
        nomeConferido: row.nomeConferido,
        cpfRegular: row.cpfRegular,
        observacaoPublica: publicMessage(row.status, row.motivos),
        atualizadoEm: FieldValue.serverTimestamp(),
      })
      operations += 1
      publishedPublic += 1
    }

    auditRows.push({
      nome: row.nome,
      cpf: row.cpfFormatado,
      nascimento: row.nascimento,
      nascimento_banco: row.nascimentoIso,
      telefone: row.telefone,
      email: row.email,
      idade_em_04_07_2026: row.idadeEm04072026,
      status: row.status,
      na_pre_lista: isInPreList ? 'SIM' : 'NAO',
      nome_conferido: row.nomeConferido ? 'SIM' : 'NAO',
      cpf_regular: row.cpfRegular ? 'SIM' : 'NAO',
      maioridade_no_evento: row.maioridadeNoEvento ? 'SIM' : 'NAO',
      processado: row.processado ? 'SIM' : 'NAO',
      conferido_em: row.conferidoEm,
      observacoes: row.observacoes,
      motivos: row.motivos,
    })

    if (operations >= 450) await commitIfNeeded()
  }

  await commitIfNeeded()

  await writeCsv(
    resultadoLocalPath,
    [
      'nome',
      'cpf',
      'nascimento',
      'nascimento_banco',
      'telefone',
      'email',
      'idade_em_04_07_2026',
      'status',
      'na_pre_lista',
      'nome_conferido',
      'cpf_regular',
      'maioridade_no_evento',
      'processado',
      'conferido_em',
      'observacoes',
      'motivos',
    ],
    auditRows,
  )

  console.log(`ResultadoConsulta normalizado: ${uniqueRows.length} CPF(s).`)
  console.log(`preLista atualizada: ${updatedPrivate} registro(s).`)
  console.log(`preListaPublica publicada: ${publishedPublic} registro(s).`)
  if (missingPrivate) console.log(`Ignorados por nao estarem na preLista: ${missingPrivate} CPF(s).`)
  console.log(`Auditoria local gerada em: ${resultadoLocalPath}`)
} catch (error) {
  console.error('Nao foi possivel publicar a lista publica a partir do ResultadoConsulta.csv.')
  console.error(error.message)
  process.exitCode = 1
}
