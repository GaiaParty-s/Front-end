const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

export const criarPagamentoMercadoPago = async (payload) => {
  const response = await fetch(`${apiBaseUrl}/api/mercadopago/preference`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Nao foi possivel iniciar o pagamento.')
  }

  return data
}

export const criarSessaoPaymentBrick = async (payload) => {
  const response = await fetch(`${apiBaseUrl}/api/mercadopago/checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Nao foi possivel iniciar o checkout.')
  }

  return data
}

export const processarPaymentBrick = async (payload) => {
  const response = await fetch(`${apiBaseUrl}/api/mercadopago/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Nao foi possivel processar o pagamento.')
  }

  return data
}
