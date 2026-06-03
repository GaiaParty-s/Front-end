import { copyFile, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const filePath = resolve('private-data', 'ResultadoConsulta.csv')

const headers = [
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

const normalizeRow = (row) => {
  const values = row.map(fixMojibake)

  if (values.length >= 18) {
    return [
      ...values.slice(0, 8),
      ...values.slice(12, 18),
    ]
  }

  return headers.map((_, index) => values[index] ?? '')
}

const hasHeader = (row) =>
  row.map((value) => value.trim().toLowerCase()).slice(0, 4).join(',') === 'nome,cpf,nascimento,nome_confere'

try {
  const content = await readFile(filePath, 'utf8')
  const rows = parseCsvRows(content)
  const dataRows = rows[0] && hasHeader(rows[0]) ? rows.slice(1) : rows
  const normalizedRows = dataRows.map(normalizeRow).filter((row) => row[0] && row[1])

  const backupPath = filePath.replace(/\.csv$/i, `.backup-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`)
  await copyFile(filePath, backupPath)

  const output = [
    headers.join(','),
    ...normalizedRows.map((row) => headers.map((_, index) => csvCell(row[index])).join(',')),
  ].join('\n')

  await writeFile(filePath, `\uFEFF${output}\n`, 'utf8')

  console.log(`ResultadoConsulta.csv normalizado: ${normalizedRows.length} registro(s).`)
  console.log(`Backup criado em: ${backupPath}`)
} catch (error) {
  console.error('Nao foi possivel normalizar o ResultadoConsulta.csv.')
  console.error(error.message)
  process.exitCode = 1
}
