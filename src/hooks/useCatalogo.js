import { useEffect, useState } from 'react'
import ingressosFallback from '../data/ingressos'
import produtosFallback from '../data/produtos'
import { carregarIngressos, carregarProdutos } from '../services/catalogo'

const normalizeProducts = (products) =>
  products.map((product) => ({
    ativo: true,
    estoque: null,
    ...product,
  }))

export const useProdutos = () => {
  const [produtos, setProdutos] = useState(normalizeProducts(produtosFallback))

  useEffect(() => {
    carregarProdutos()
      .then((items) => {
        if (items.length) setProdutos(normalizeProducts(items))
      })
      .catch(() => console.warn('Não foi possível carregar os produtos do Firestore. Usando fallback local.'))
  }, [])

  return produtos
}

export const useIngressos = () => {
  const [ingressos, setIngressos] = useState(ingressosFallback)

  useEffect(() => {
    carregarIngressos()
      .then((items) => {
        if (items.length) setIngressos(items)
      })
      .catch(() => console.warn('Não foi possível carregar os ingressos do Firestore. Usando fallback local.'))
  }, [])

  return ingressos
}
