import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

const sortById = (items) =>
  items.sort((a, b) => String(a.id).localeCompare(String(b.id), 'pt-BR', { numeric: true }))

const readCollection = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName))
  return sortById(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })))
}

export const carregarProdutos = () => readCollection('Produtos')

export const carregarIngressos = () => readCollection('ingressos')
