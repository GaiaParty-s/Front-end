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

const formatCpf = (value = '') => {
  const digits = String(value).replace(/\D/g, '')
  return digits.length === 11 ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : value
}

const formatPhone = (value = '') => {
  const digits = String(value).replace(/\D/g, '')
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return value
}

try {
  const credentials = JSON.parse(await readFile(credentialsPath, 'utf8'))
  initializeApp({ credential: cert(credentials) })

  const snapshot = await getFirestore().collection('preLista').orderBy('criadoEm', 'asc').get()
  const headers = ['id', 'nome', 'cpf', 'nascimento', 'telefone', 'email', 'status', 'consentimento', 'criadoEm']
  const rows = snapshot.docs.map((document) => {
    const data = document.data()
    return headers.map((header) => {
      let value = header === 'id' ? document.id : data[header]
      if (header === 'cpf') value = formatCpf(value)
      if (header === 'telefone') value = formatPhone(value)
      if (header === 'criadoEm') value = data.criadoEm?.toDate().toISOString()
      return csvCell(value)
    }).join(',')
  })

  await mkdir(privateDir, { recursive: true })
  await writeFile(outputPath, `\uFEFF${headers.join(',')}\n${rows.join('\n')}\n`, 'utf8')
  console.log(`Exportação concluída: ${snapshot.size} cadastro(s).`)
  console.log(`Arquivo gerado em: ${outputPath}`)
} catch (error) {
  console.error('Não foi possível exportar a pré-lista.')
  console.error(`Confirme a existência de ${credentialsPath}`)
  console.error(error.message)
  process.exitCode = 1
}
