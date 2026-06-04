const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

const onlyDigits = (value) => value.replace(/\D/g, '')

export const cadastrarNaPreLista = async (form) => {
  const response = await fetch(`${apiBaseUrl}/api/lista/cadastro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nome: form.nome.trim().replace(/\s+/g, ' '),
      cpf: onlyDigits(form.cpf),
      nascimento: form.nascimento,
      telefone: onlyDigits(form.telefone),
      email: form.email.trim().toLowerCase(),
    }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Nao foi possivel cadastrar.')
  }

  return data
}
