const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

const onlyDigits = (value) => value.replace(/\D/g, '')

const postLista = async (path, cpf) => {
  const response = await fetch(`${apiBaseUrl}/api/lista/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cpf: onlyDigits(cpf) }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Nao foi possivel consultar agora.')
  }

  return data.resultado || null
}

export const consultarSituacaoPreLista = (cpf) => postLista('consultar', cpf)

export const conferirCpfLista = (cpf) => postLista('conferir-cpf', cpf)
