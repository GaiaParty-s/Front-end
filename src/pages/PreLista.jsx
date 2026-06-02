import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Icon from '../components/Icons'
import Navbar from '../components/Navbar'

const initialForm = { nome: '', cpf: '', nascimento: '', telefone: '', email: '' }

const onlyDigits = (value) => value.replace(/\D/g, '')

const calculateAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(`${birthDate}T12:00:00`)
  let age = today.getFullYear() - birth.getFullYear()
  const month = today.getMonth() - birth.getMonth()
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1
  return age
}

function PreLista() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const updateField = ({ target: { name, value } }) => {
    setForm({ ...form, [name]: value })
    setErrors({ ...errors, [name]: '' })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    Object.entries(form).forEach(([field, value]) => {
      if (!value.trim()) nextErrors[field] = 'Preencha este campo.'
    })
    if (form.cpf && onlyDigits(form.cpf).length !== 11) nextErrors.cpf = 'Informe um CPF com 11 dígitos.'
    if (form.nascimento && calculateAge(form.nascimento) < 18) nextErrors.nascimento = 'A pré-lista é permitida apenas para maiores de 18 anos.'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    // Integração futura: validar CPF, consultar backend, aprovar cadastro e liberar pagamento.
    setSent(true)
    setForm(initialForm)
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
                  <input name="cpf" value={form.cpf} onChange={updateField} placeholder="Somente números" inputMode="numeric" maxLength="14" />
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
                  <input name="telefone" value={form.telefone} onChange={updateField} placeholder="(11) 99999-9999" inputMode="tel" />
                  {errors.telefone && <small>{errors.telefone}</small>}
                </label>
                <label className="field">
                  <span>E-mail</span>
                  <input name="email" type="email" value={form.email} onChange={updateField} placeholder="voce@email.com" />
                  {errors.email && <small>{errors.email}</small>}
                </label>
              </div>
              <div className="form-bottom">
                <p>Ao enviar, você confirma que possui mais de 18 anos.</p>
                <button className="button" type="submit">Enviar cadastro <Icon name="arrow" size={17} /></button>
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
