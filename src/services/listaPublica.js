import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

const onlyDigits = (value) => value.replace(/\D/g, '')

const cpfHash = async (cpf) => {
  const data = new TextEncoder().encode(onlyDigits(cpf))
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hashBuffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 32)
}

export const consultarSituacaoPreLista = async (cpf) => {
  const id = await cpfHash(cpf)
  const snapshot = await getDoc(doc(db, 'preListaPublica', id))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}
