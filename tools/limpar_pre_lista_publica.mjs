import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const credentialsPath = resolve('private-data', 'firebase-service-account.json')
const apply = process.argv.includes('--apply')
const collectionName = 'preListaPublica'
const batchSize = 450

try {
  const credentials = JSON.parse(await readFile(credentialsPath, 'utf8'))
  initializeApp({ credential: cert(credentials) })
  const db = getFirestore()

  const snapshot = await db.collection(collectionName).get()
  console.log(`${collectionName}: ${snapshot.size} documento(s) encontrado(s).`)

  if (!apply) {
    console.log('Dry-run apenas. Para apagar de verdade, rode: npm run cleanup:prelista-publica')
    process.exit(0)
  }

  let deleted = 0
  let batch = db.batch()

  for (const document of snapshot.docs) {
    batch.delete(document.ref)
    deleted += 1

    if (deleted % batchSize === 0) {
      await batch.commit()
      batch = db.batch()
      console.log(`${deleted} documento(s) apagado(s)...`)
    }
  }

  if (deleted % batchSize !== 0) await batch.commit()

  console.log(`${collectionName}: ${deleted} documento(s) apagado(s).`)
} catch (error) {
  console.error(`Nao foi possivel limpar ${collectionName}.`)
  console.error(error)
  process.exit(1)
}
