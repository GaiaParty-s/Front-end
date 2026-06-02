import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const privateDir = resolve('private-data')
const credentialsPath = resolve(privateDir, 'firebase-service-account.json')
const backupPath = resolve(privateDir, `prelista-backup-normalizacao-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)

const digits = (value = '') => String(value).replace(/\D/g, '')

try {
  const credentials = JSON.parse(await readFile(credentialsPath, 'utf8'))
  initializeApp({ credential: cert(credentials) })
  const db = getFirestore()

  const snapshot = await db.collection('preLista').get()
  const docs = snapshot.docs.map((document) => ({ id: document.id, data: document.data() }))
  await mkdir(privateDir, { recursive: true })
  await writeFile(backupPath, JSON.stringify(docs, null, 2), 'utf8')

  const grouped = new Map()
  for (const item of docs) {
    const cpf = digits(item.data.cpf)
    if (!cpf || cpf.length !== 11) continue
    const current = grouped.get(cpf)
    const currentDate = current?.data.criadoEm?.toMillis?.() ?? Number.MAX_SAFE_INTEGER
    const itemDate = item.data.criadoEm?.toMillis?.() ?? Number.MAX_SAFE_INTEGER
    if (!current || itemDate < currentDate) grouped.set(cpf, item)
  }

  let batch = db.batch()
  let operations = 0
  const commitIfNeeded = async () => {
    if (!operations) return
    await batch.commit()
    batch = db.batch()
    operations = 0
  }

  for (const [cpf, item] of grouped.entries()) {
    batch.set(db.collection('preLista').doc(cpf), { ...item.data, cpf })
    operations += 1
    if (operations >= 450) await commitIfNeeded()
  }

  for (const item of docs) {
    const cpf = digits(item.data.cpf)
    const selected = grouped.get(cpf)
    if (item.id !== cpf || selected?.id !== item.id) {
      batch.delete(db.collection('preLista').doc(item.id))
      operations += 1
      if (operations >= 450) await commitIfNeeded()
    }
  }

  await commitIfNeeded()
  console.log(`Backup criado em: ${backupPath}`)
  console.log(`Pré-lista normalizada: ${grouped.size} CPF(s) único(s), ${docs.length - grouped.size} duplicado(s)/documento(s) antigo(s) removido(s).`)
} catch (error) {
  console.error('Não foi possível normalizar a pré-lista.')
  console.error(error.message)
  process.exitCode = 1
}
