import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

const onlyDigits = (value) => value.replace(/\D/g, '')

export const cadastrarNaPreLista = async (form) => {
  const cpf = onlyDigits(form.cpf)

  return setDoc(doc(db, 'preLista', cpf), {
    nome: form.nome.trim().replace(/\s+/g, ' '),
    cpf,
    nascimento: form.nascimento,
    telefone: onlyDigits(form.telefone),
    email: form.email.trim().toLowerCase(),
    criadoEm: serverTimestamp(),
    consentimento: true,
    status: 'pendente',
  })
}
