import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const credentialsPath = resolve('private-data', 'firebase-service-account.json')
const apply = process.argv.includes('--apply')

const onlyDigits = (value = '') => String(value || '').replace(/\D/g, '')

const publicId = (cpf) => createHash('sha256').update(onlyDigits(cpf)).digest('hex').slice(0, 32)

const normalizeStatus = (status = '') => {
  if (status === 'pago') return 'pago'
  if (status === 'approved') return 'pago'
  if (status === 'aprovado') return 'aprovado'
  if (status === 'recusado' || status === 'reprovado') return 'recusado'
  return 'pendente'
}

const publicMessage = (status) => {
  if (status === 'pago') return 'Pagamento confirmado.'
  if (status === 'aprovado') return 'CPF e dados OK.'
  if (status === 'recusado') return 'CPF ou dados incorretos.'
  return 'Pendente da aprovacao.'
}

const timestampValue = (value) => {
  if (!value) return null
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (typeof value.toDate === 'function') return value.toDate().getTime()
  const parsed = Date.parse(String(value))
  return Number.isNaN(parsed) ? null : parsed
}

const newerPayment = (current, next) => {
  if (!current) return next
  const currentTime = timestampValue(current.atualizadoEm || current.criadoEm || current.providerResponse?.dateCreated)
  const nextTime = timestampValue(next.atualizadoEm || next.criadoEm || next.providerResponse?.dateCreated)
  return (nextTime || 0) >= (currentTime || 0) ? next : current
}

const paymentStatus = (pedido = {}) => {
  if (pedido.status === 'approved' || pedido.status === 'pago') return 'pago'
  return pedido.status || 'aguardando_pagamento'
}

try {
  const credentials = JSON.parse(await readFile(credentialsPath, 'utf8'))
  initializeApp({ credential: cert(credentials) })
  const db = getFirestore()

  const [listaSnapshot, preListaSnapshot, pedidosSnapshot] = await Promise.all([
    db.collection('Lista').get(),
    db.collection('preLista').get(),
    db.collection('pedidos').get(),
  ])

  const listaByCpf = new Map()
  for (const document of listaSnapshot.docs) {
    const data = document.data()
    const cpf = onlyDigits(data.cpf || document.id)
    if (cpf.length === 11) listaByCpf.set(cpf, { id: document.id, ...data })
  }

  const pedidosByCpf = new Map()
  for (const document of pedidosSnapshot.docs) {
    const data = document.data()
    const cpf = onlyDigits(data.comprador?.cpf)
    if (cpf.length !== 11) continue
    pedidosByCpf.set(cpf, newerPayment(pedidosByCpf.get(cpf), { id: document.id, ...data }))
  }

  const allCpfs = new Set([
    ...preListaSnapshot.docs.map((document) => onlyDigits(document.data().cpf || document.id)),
    ...listaByCpf.keys(),
  ].filter((cpf) => cpf.length === 11))

  let batch = db.batch()
  let operations = 0
  let migrated = 0
  let publicUpdated = 0
  let paymentsLinked = 0

  const commitIfNeeded = async () => {
    if (!apply || operations === 0) return
    await batch.commit()
    batch = db.batch()
    operations = 0
  }

  for (const cpf of allCpfs) {
    const preDoc = preListaSnapshot.docs.find((document) => onlyDigits(document.data().cpf || document.id) === cpf)
    const preData = preDoc?.data() || {}
    const listaData = listaByCpf.get(cpf) || {}
    const pedido = pedidosByCpf.get(cpf)
    const currentStatus = normalizeStatus(listaData.status || preData.status)
    const status = pedido && paymentStatus(pedido) === 'pago' ? 'pago' : currentStatus
    const nome = listaData.nome || preData.nome || pedido?.comprador?.nome || ''

    const merged = {
      nome,
      cpf,
      nascimento: listaData.nascimento || preData.nascimento || '',
      telefone: onlyDigits(listaData.telefone || preData.telefone || pedido?.comprador?.telefone || ''),
      email: String(listaData.email || preData.email || pedido?.comprador?.email || '').trim().toLowerCase(),
      consentimento: listaData.consentimento ?? preData.consentimento ?? true,
      status,
      validacaoCpf: listaData.validacaoCpf || preData.validacaoCpf || preData.validacaoConsulta || null,
      origem: {
        preLista: Boolean(preDoc),
        migradoEm: FieldValue.serverTimestamp(),
      },
      atualizadoEm: FieldValue.serverTimestamp(),
      criadoEm: listaData.criadoEm || preData.criadoEm || FieldValue.serverTimestamp(),
    }

    if (pedido) {
      merged.pagamento = {
        status: paymentStatus(pedido),
        pedidoId: pedido.id,
        paymentId: pedido.paymentId || null,
        metodo: pedido.paymentMethodId || null,
        tipo: pedido.paymentTypeId || null,
        valor: pedido.paidAmount || pedido.total || null,
        atualizadoEm: FieldValue.serverTimestamp(),
      }
      paymentsLinked += 1
    }

    const publicData = {
      nome,
      cpfFinal: cpf.slice(-4),
      status,
      observacaoPublica: publicMessage(status),
      atualizadoEm: FieldValue.serverTimestamp(),
    }

    if (apply) {
      batch.set(db.collection('Lista').doc(cpf), merged, { merge: true })
      batch.set(db.collection('preListaPublica').doc(publicId(cpf)), publicData, { merge: true })
      operations += 2
      if (operations >= 440) await commitIfNeeded()
    }

    migrated += 1
    publicUpdated += 1
  }

  await commitIfNeeded()

  console.log(`${apply ? 'Migracao aplicada' : 'Dry-run concluido'}.`)
  console.log(`Lista processada: ${migrated} cadastro(s).`)
  console.log(`preListaPublica atualizada: ${publicUpdated} cadastro(s).`)
  console.log(`Pedidos vinculados: ${paymentsLinked} cadastro(s).`)
  if (!apply) console.log('Execute com --apply para gravar no Firestore.')
} catch (error) {
  console.error('Nao foi possivel migrar para a collection Lista.')
  console.error(error)
  process.exitCode = 1
}
