import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { conferirCpfLista, consultarSituacaoPreLista } from '../services/listaPublica'

const statusLabel = {
  aprovado: 'Aprovado',
  pago: 'Pago',
  pendente: 'Pendente',
  recusado: 'Recusado',
  reprovado: 'Recusado',
}

const onlyDigits = (value) => value.replace(/\D/g, '')

const formatCpf = (value) =>
  onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

const whatsappUrl = (resultado) => {
  const message = [
    'Oi, preciso de ajuda com minha pre-lista.',
    `Nome: ${resultado?.nome || ''}`,
    `CPF final: ${resultado?.cpfFinal || ''}`,
    `Status: ${statusLabel[resultado?.status] || resultado?.status || ''}`,
  ].join('\n')

  return `https://wa.me/5511962687827?text=${encodeURIComponent(message)}`
}

function ListaPublica() {
  const [cpf, setCpf] = useState('')
  const [resultado, setResultado] = useState(null)
  const [consultado, setConsultado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const consultar = async (event) => {
    event.preventDefault()
    setResultado(null)
    setConsultado(false)
    setErro('')

    if (onlyDigits(cpf).length !== 11) {
      setErro('Informe um CPF completo para consultar.')
      return
    }

    setCarregando(true)
    try {
      setResultado(await consultarSituacaoPreLista(cpf))
      setConsultado(true)
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

  const conferirCpf = async () => {
    setErro('')
    setCarregando(true)

    try {
      setResultado(await conferirCpfLista(cpf))
      setConsultado(true)
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="inner-page">
        <section className="page-hero compact">
          <div className="container">
            <p className="eyebrow">Lista oficial</p>
            <h1>Confira sua <em>situacao.</em></h1>
            <p>Digite seu CPF para consultar se esta pendente, aprovado, pago ou recusado.</p>
          </div>
        </section>
        <section className="list-section">
          <div className="container narrow-container">
            <form className="prelist-form lookup-card" onSubmit={consultar} noValidate>
              <div className="form-heading">
                <span>01</span>
                <div>
                  <h2>Consulta individual</h2>
                  <p>Use o mesmo CPF enviado no cadastro da pre-lista.</p>
                </div>
              </div>
              <label className="field field-full">
                <span>CPF</span>
                <input value={cpf} onChange={(event) => setCpf(formatCpf(event.target.value))} placeholder="000.000.000-00" inputMode="numeric" maxLength="14" autoComplete="off" />
                {erro && <small>{erro}</small>}
              </label>
              <button className="button button-wide" type="submit" disabled={carregando}>
                {carregando ? 'Consultando...' : 'Consultar situacao'}
              </button>
            </form>

            {resultado && (
              <article className={`lookup-result status-${resultado.status}`}>
                <p className="eyebrow">Resultado encontrado</p>
                <h2>{resultado.nome}</h2>
                <span>CPF final {resultado.cpfFinal}</span>
                <strong>{statusLabel[resultado.status] || 'Pendente'}</strong>
                <p>{resultado.observacaoPublica}</p>
                {resultado.status === 'pendente' && (
                  <button className="button button-small" type="button" disabled={carregando} onClick={conferirCpf}>
                    {carregando ? 'Conferindo...' : 'Conferir CPF agora'}
                  </button>
                )}
                {(resultado.status === 'recusado' || resultado.status === 'reprovado') && (
                  <a className="button button-small" href={whatsappUrl(resultado)} target="_blank" rel="noreferrer">
                    Falar no WhatsApp
                  </a>
                )}
              </article>
            )}

            {consultado && !resultado && (
              <div className="lookup-result status-recusado">
                <p className="eyebrow">Nao encontrado</p>
                <h2>CPF nao localizado</h2>
                <p>Confira se o numero foi digitado corretamente ou faca seu cadastro na pre-lista.</p>
                <Link className="button button-small" to="/pre-lista">Entrar na pre-lista</Link>
              </div>
            )}

            <p className="list-disclaimer">
              A aprovacao final podera exigir documento oficial com foto na entrada. CPF completo, telefone, e-mail e data de nascimento permanecem protegidos.
            </p>
            <Link className="back-link" to="/">Voltar para o evento</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default ListaPublica
