import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Icon from '../components/Icons'
import Navbar from '../components/Navbar'
import { cadastrarNaPreLista } from '../services/preLista'

const initialForm = { nome: '', cpf: '', nascimento: '', telefone: '', email: '' }
const EVENT_DATE = new Date('2026-07-04T12:00:00')
const MINIMUM_BIRTH_DATE = new Date('2010-01-04T12:00:00')

const onlyDigits = (value) => value.replace(/\D/g, '')

const formatCpf = (value) =>
  onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

const formatPhone = (value) => {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 2) return digits.replace(/(\d{1,2})/, '($1')
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d+)/, '($1) $2')
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3')
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}

const isValidCpf = (value) => {
  const digits = onlyDigits(value)
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false

  const calculateDigit = (length) => {
    const total = digits
      .slice(0, length)
      .split('')
      .reduce((sum, digit, index) => sum + Number(digit) * (length + 1 - index), 0)
    const remainder = (total * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  return calculateDigit(9) === Number(digits[9]) && calculateDigit(10) === Number(digits[10])
}

const isCompleteName = (value) => {
  const nameParts = value.trim().replace(/\s+/g, ' ').split(' ')
  return nameParts.length >= 2 && nameParts.every((part) => part.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'-]/g, '').length >= 2)
}

const calculateAge = (birthDate) => {
  const birth = new Date(`${birthDate}T12:00:00`)
  let age = EVENT_DATE.getFullYear() - birth.getFullYear()
  const month = EVENT_DATE.getMonth() - birth.getMonth()
  if (month < 0 || (month === 0 && EVENT_DATE.getDate() < birth.getDate())) age -= 1
  return age
}

const meetsMinimumAge = (birthDate) => new Date(`${birthDate}T12:00:00`) <= MINIMUM_BIRTH_DATE

function PreLista() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [consentimento, setConsentimento] = useState(false)

  const updateField = ({ target: { name, value } }) => {
    const formattedValue = name === 'cpf' ? formatCpf(value) : name === 'telefone' ? formatPhone(value) : value
    setForm({ ...form, [name]: formattedValue })
    setErrors({ ...errors, [name]: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    Object.entries(form).forEach(([field, value]) => {
      if (!value.trim()) nextErrors[field] = 'Preencha este campo.'
    })
    if (form.nome && !isCompleteName(form.nome)) nextErrors.nome = 'Informe seu nome completo.'
    if (form.cpf && !isValidCpf(form.cpf)) nextErrors.cpf = 'Informe um CPF válido.'
    if (form.telefone && !/^\d{10,11}$/.test(onlyDigits(form.telefone))) nextErrors.telefone = 'Informe um telefone com DDD.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Informe um e-mail válido.'
    if (form.nascimento && (!meetsMinimumAge(form.nascimento) || calculateAge(form.nascimento) > 120)) nextErrors.nascimento = 'A pré-lista é permitida apenas para quem terá 18 anos ou mais em 04/07/2026.'
    if (!consentimento) nextErrors.consentimento = 'Confirme o aceite para enviar seu cadastro.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      await cadastrarNaPreLista(form)
      setSent(true)
      setForm(initialForm)
      setConsentimento(false)
    } catch {
      setSubmitError('Este CPF já está cadastrado na pré-lista ou os dados foram recusados pela validação.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="inner-page">
        <section className="page-hero">
          <div className="container">
            <p className="eyebrow">Seu lugar no sunset</p>
            <h1>Entre na <em>pré-lista.</em></h1>
            <p>Cadastre seus dados para receber novidades e iniciar sua jornada para a Sunset Sessions.</p>
          </div>
        </section>
        <section className="form-section">
          <div className="container narrow-container">
            {sent && (
              <div className="success-message">
                <div className="icon-orb"><Icon name="check" size={24} /></div>
                <div><h3>Cadastro recebido!</h3><p>Seu envio foi registrado com sucesso. A aprovação e o pagamento serão conectados em uma próxima etapa.</p></div>
              </div>
            )}
            {submitError && <div className="form-error-message">{submitError}</div>}
            <form className="prelist-form" onSubmit={handleSubmit} noValidate>
              <div className="form-heading">
                <span>01</span>
                <div><h2>Informações pessoais</h2><p>Preencha os campos abaixo para solicitar sua entrada na lista.</p></div>
              </div>
              <label className="field field-full">
                <span>Nome completo</span>
                <input name="nome" value={form.nome} onChange={updateField} placeholder="Seu nome completo" />
                {errors.nome && <small>{errors.nome}</small>}
              </label>
              <div className="field-row">
                <label className="field">
                  <span>CPF</span>
                  <input name="cpf" value={form.cpf} onChange={updateField} placeholder="000.000.000-00" inputMode="numeric" maxLength="14" autoComplete="off" />
                  {errors.cpf && <small>{errors.cpf}</small>}
                </label>
                <label className="field">
                  <span>Data de nascimento</span>
                  <input name="nascimento" type="date" value={form.nascimento} onChange={updateField} />
                  {errors.nascimento && <small>{errors.nascimento}</small>}
                </label>
              </div>
              <div className="field-row">
                <label className="field">
                  <span>Telefone / WhatsApp</span>
                  <input name="telefone" value={form.telefone} onChange={updateField} placeholder="(11) 99999-9999" inputMode="tel" maxLength="15" autoComplete="tel" />
                  {errors.telefone && <small>{errors.telefone}</small>}
                </label>
                <label className="field">
                  <span>E-mail</span>
                  <input name="email" type="email" value={form.email} onChange={updateField} placeholder="voce@email.com" />
                  {errors.email && <small>{errors.email}</small>}
                </label>
              </div>
              <label className="consent-field">
                <input type="checkbox" checked={consentimento} onChange={(event) => {
                  setConsentimento(event.target.checked)
                  setErrors({ ...errors, consentimento: '' })
                }} />
                <span>Autorizo o armazenamento dos meus dados para análise e contato sobre a pré-lista da Sunset Sessions.</span>
              </label>
              {errors.consentimento && <small className="consent-error">{errors.consentimento}</small>}
              <div className="form-bottom">
                <p>Ao enviar, você confirma que terá 18 anos ou mais em 04/07/2026.</p>
                <button className="button" type="submit" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar cadastro'} {!submitting && <Icon name="arrow" size={17} />}</button>
              </div>
            </form>
            <Link className="back-link" to="/">← Voltar para o evento</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default PreLista
