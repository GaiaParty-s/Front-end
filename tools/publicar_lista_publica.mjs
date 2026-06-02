import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const privateDir = resolve('private-data')
const credentialsPath = resolve(privateDir, 'firebase-service-account.json')
const listaPath = resolve(privateDir, 'lista-publica.csv')

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
    } else if (char === ',' && !quoted) {
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

  const headers = rows.shift()?.map((header) => header.replace(/^\uFEFF/, '')) ?? []
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
}

const toBoolean = (value) => String(value).toLowerCase() === 'true'

const stableId = (row) =>
  createHash('sha256').update(String(row.cpf || '').replace(/\D/g, '')).digest('hex').slice(0, 32)

try {
  const credentials = JSON.parse(await readFile(credentialsPath, 'utf8'))
  initializeApp({ credential: cert(credentials) })

  const rows = parseCsv(await readFile(listaPath, 'utf8'))
  const db = getFirestore()
  const collectionRef = db.collection('preListaPublica')
  const existing = await collectionRef.get()

  let batch = db.batch()
  let operations = 0
  const commitIfNeeded = async () => {
    if (operations === 0) return
    await batch.commit()
    batch = db.batch()
    operations = 0
  }

  for (const document of existing.docs) {
    batch.delete(document.ref)
    operations += 1
    if (operations >= 450) await commitIfNeeded()
  }

  for (const row of rows) {
    if (!row.nome) continue
    const ref = collectionRef.doc(stableId(row))
    batch.set(ref, {
      nome: row.nome,
      cpfFinal: row.cpfFinal,
      naPreLista: toBoolean(row.naPreLista),
      status: row.status,
      maioridadeNoEvento: toBoolean(row.maioridadeNoEvento),
      nomeConferido: toBoolean(row.nomeConferido),
      cpfRegular: toBoolean(row.cpfRegular),
      observacaoPublica: row.observacaoPublica,
    })
    operations += 1
    if (operations >= 450) await commitIfNeeded()
  }

  await commitIfNeeded()
  console.log(`Lista pública publicada: ${rows.length} registro(s).`)
} catch (error) {
  console.error('Não foi possível publicar a lista pública.')
  console.error(error.message)
  process.exitCode = 1
}
