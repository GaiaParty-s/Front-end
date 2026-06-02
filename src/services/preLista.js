import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const onlyDigits = (value) => value.replace(/\D/g, '')

export const cadastrarNaPreLista = async (form) =>
  addDoc(collection(db, 'preLista'), {
    nome: form.nome.trim().replace(/\s+/g, ' '),
    cpf: onlyDigits(form.cpf),
    nascimento: form.nascimento,
    telefone: onlyDigits(form.telefone),
    email: form.email.trim().toLowerCase(),
    criadoEm: serverTimestamp(),
    consentimento: true,
    status: 'pendente',
  })
