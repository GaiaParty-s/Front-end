import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const privateDir = resolve('private-data')
const credentialsPath = resolve(privateDir, 'firebase-service-account.json')
const catalogPath = resolve(privateDir, 'catalogo.json')
const action = process.argv[2]

const sortById = (items) =>
  items.sort((a, b) => String(a.id).localeCompare(String(b.id), 'pt-BR', { numeric: true }))

const readCollection = async (db, collectionName) => {
  const snapshot = await db.collection(collectionName).get()
  return sortById(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })))
}

const writeCollection = async (db, collectionName, items) => {
  if (!Array.isArray(items)) throw new Error(`O campo ${collectionName} deve ser uma lista.`)
  const batch = db.batch()
  items.forEach(({ id, ...data }) => {
    if (id === undefined || id === null || id === '') throw new Error(`Existe um item sem id em ${collectionName}.`)
    batch.set(db.collection(collectionName).doc(String(id)), data)
  })
  await batch.commit()
  console.log(`${collectionName}: ${items.length} item(ns) publicado(s).`)
}

try {
  if (!['baixar', 'publicar'].includes(action)) {
    throw new Error('Use: node tools/gerenciar_catalogo.mjs baixar | publicar')
  }

  const credentials = JSON.parse(await readFile(credentialsPath, 'utf8'))
  initializeApp({ credential: cert(credentials) })
  const db = getFirestore()

  if (action === 'baixar') {
    const [produto, ingressos] = await Promise.all([
      readCollection(db, 'Produtos'),
      readCollection(db, 'ingressos'),
    ])
    await mkdir(privateDir, { recursive: true })
    await writeFile(catalogPath, `${JSON.stringify({ produto, ingressos }, null, 2)}\n`, 'utf8')
    console.log(`Catálogo baixado para: ${catalogPath}`)
    console.log('Edite o arquivo e execute npm run catalogo:publicar para enviar as alterações.')
  } else {
    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
    await writeCollection(db, 'Produtos', catalog.produto)
    await writeCollection(db, 'ingressos', catalog.ingressos)
    console.log('Catálogo publicado com sucesso.')
    console.log('Para ocultar um item sem excluí-lo, use "ativo": false.')
  }
} catch (error) {
  console.error('Não foi possível gerenciar o catálogo.')
  console.error(error.message)
  process.exitCode = 1
}
