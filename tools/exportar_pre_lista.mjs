import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const privateDir = resolve('private-data')
const credentialsPath = resolve(privateDir, 'firebase-service-account.json')
const outputPath = resolve(privateDir, 'cadastros-firestore.csv')

const csvCell = (value = '') => {
  const text = String(value).replaceAll('"', '""')
  return `"${text}"`
}

try {
  const credentials = JSON.parse(await readFile(credentialsPath, 'utf8'))
  initializeApp({ credential: cert(credentials) })

  const snapshot = await getFirestore().collection('preLista').orderBy('criadoEm', 'asc').get()
  const headers = ['nome', 'cpf', 'nascimento', 'telefone', 'email', 'status', 'criadoEm']
  const rows = snapshot.docs.map((document) => {
    const data = document.data()
    return headers.map((header) => {
      const value = header === 'criadoEm' ? data.criadoEm?.toDate().toISOString() : data[header]
      return csvCell(value)
    }).join(',')
  })

  await mkdir(privateDir, { recursive: true })
  await writeFile(outputPath, `${headers.join(',')}\n${rows.join('\n')}\n`, 'utf8')
  console.log(`Exportação concluída: ${snapshot.size} cadastro(s).`)
  console.log(`Arquivo gerado em: ${outputPath}`)
} catch (error) {
  console.error('Não foi possível exportar a pré-lista.')
  console.error(`Confirme a existência de ${credentialsPath}`)
  console.error(error.message)
  process.exitCode = 1
}
