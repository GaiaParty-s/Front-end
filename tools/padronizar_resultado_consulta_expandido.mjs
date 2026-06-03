import { copyFile, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const filePath = resolve('private-data', 'ResultadoConsulta.csv')
const minimumBirthDate = new Date(Date.UTC(2010, 0, 4))

const expandedHeaders = [
  'nome',
  'cpf',
  'nascimento',
  'nome_confere',
  'status_receita',
  'conferido_em',
  'observacoes',
  'link_consulta',
  'telefone',
  'nascimento_banco',
  'menor_de_idade',
  'na_pre_lista',
  'data_inscricao',
  'digito_verificador',
  'comprovante_emitido',
  'comprovante_emitido_data',
  'consultas_consumidas',
  'processado',
]

const compactHeaders = [
  'nome',
  'cpf',
  'nascimento',
  'nome_confere',
  'status_receita',
  'conferido_em',
  'observacoes',
  'link_consulta',
  'data_inscricao',
  'digito_verificador',
  'comprovante_emitido',
  'comprovante_emitido_data',
  'consultas_consumidas',
  'processado',
]

const parseCsvRows = (content) => {
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
      if (row.some((value) => value.trim() !== '')) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  if (cell || row.length) {
    row.push(cell)
    if (row.some((value) => value.trim() !== '')) rows.push(row)
  }

  return rows
}

const csvCell = (value = '') => `"${String(value).trim().replaceAll('"', '""')}"`

const fixMojibake = (value = '') => {
  const text = String(value).trim()
  if (!/[ÃÂ]/.test(text)) return text
  try {
    return Buffer.from(text, 'latin1').toString('utf8')
  } catch {
    return text
  }
}

const parseBirthToIso = (value = '') => {
  const text = String(value).trim()
  const br = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (br) return `${br[3]}-${br[2]}-${br[1]}`
  return text.match(/^\d{4}-\d{2}-\d{2}$/) ? text : ''
}

const ageOnEvent = (isoDate) => {
  const match = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const birth = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  const event = new Date(Date.UTC(2026, 6, 4))
  let age = event.getUTCFullYear() - birth.getUTCFullYear()
  const beforeBirthday =
    event.getUTCMonth() < birth.getUTCMonth()
    || (event.getUTCMonth() === birth.getUTCMonth() && event.getUTCDate() < birth.getUTCDate())
  if (beforeBirthday) age -= 1
  return age
}

const meetsMinimumAge = (isoDate) => {
  const match = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return false
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) <= minimumBirthDate
}

const normalizeHeader = (value = '') => String(value).replace(/^\uFEFF/, '').trim().toLowerCase()

const hasKnownHeader = (row) => ['nome', 'cpf', 'nascimento'].every((header, index) => normalizeHeader(row[index]) === header)

const rowToObject = (headers, row) =>
  Object.fromEntries(headers.map((header, index) => [header, fixMojibake(row[index] ?? '')]))

const expandRow = (row, sourceHeaders) => {
  if (sourceHeaders.length >= 18) {
    const expanded = row.slice(0, 18).map(fixMojibake)
    expanded[9] ||= parseBirthToIso(expanded[2])
    expanded[10] ||= ageOnEvent(expanded[9]) !== null && !meetsMinimumAge(expanded[9]) ? 'SIM' : 'NAO'
    expanded[11] ||= 'SIM'
    return expanded
  }

  const data = rowToObject(sourceHeaders, row)
  const nascimentoBanco = data.nascimento_banco || parseBirthToIso(data.nascimento)
  const age = ageOnEvent(nascimentoBanco)

  return [
    data.nome,
    data.cpf,
    data.nascimento,
    data.nome_confere,
    data.status_receita,
    data.conferido_em,
    data.observacoes,
    data.link_consulta,
    data.telefone || '',
    nascimentoBanco,
    age !== null && !meetsMinimumAge(nascimentoBanco) ? 'SIM' : 'NAO',
    data.na_pre_lista || 'SIM',
    data.data_inscricao,
    data.digito_verificador,
    data.comprovante_emitido,
    data.comprovante_emitido_data,
    data.consultas_consumidas,
    data.processado,
  ]
}

try {
  const content = await readFile(filePath, 'utf8')
  const rows = parseCsvRows(content)
  const sourceHasHeader = rows[0] && hasKnownHeader(rows[0])
  const sourceHeaders = sourceHasHeader
    ? rows[0].map((header) => normalizeHeader(header))
    : rows[0]?.length >= 18 ? expandedHeaders : compactHeaders
  const dataRows = sourceHasHeader ? rows.slice(1) : rows
  const expandedRows = dataRows
    .map((row) => expandRow(row, sourceHeaders))
    .filter((row) => row[0] && row[1])

  const backupPath = filePath.replace(/\.csv$/i, `.compact-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`)
  await copyFile(filePath, backupPath)

  const output = [
    expandedHeaders.join(','),
    ...expandedRows.map((row) => expandedHeaders.map((_, index) => csvCell(row[index])).join(',')),
  ].join('\n')

  await writeFile(filePath, `\uFEFF${output}\n`, 'utf8')
  console.log(`ResultadoConsulta.csv padronizado no formato expandido: ${expandedRows.length} registro(s).`)
  console.log(`Backup criado em: ${backupPath}`)
} catch (error) {
  console.error('Nao foi possivel padronizar o ResultadoConsulta.csv no formato expandido.')
  console.error(error.message)
  process.exitCode = 1
}
