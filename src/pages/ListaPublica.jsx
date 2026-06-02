import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { consultarSituacaoPreLista } from '../services/listaPublica'

const statusLabel = {
  aprovado: 'Aprovado',
  pendente: 'Em análise',
  reprovado: 'Pendência',
}

const onlyDigits = (value) => value.replace(/\D/g, '')

const formatCpf = (value) =>
  onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

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
    } catch {
      setErro('Não foi possível consultar agora. Tente novamente em alguns instantes.')
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
            <p className="eyebrow">Pré-lista oficial</p>
            <h1>Confira sua <em>situação.</em></h1>
            <p>Digite seu CPF para consultar o status da análise. A página não exibe a lista completa de convidados.</p>
          </div>
        </section>
        <section className="list-section">
          <div className="container narrow-container">
            <form className="prelist-form lookup-card" onSubmit={consultar} noValidate>
              <div className="form-heading">
                <span>01</span>
                <div>
                  <h2>Consulta individual</h2>
                  <p>Use o mesmo CPF enviado no cadastro da pré-lista.</p>
                </div>
              </div>
              <label className="field field-full">
                <span>CPF</span>
                <input value={cpf} onChange={(event) => setCpf(formatCpf(event.target.value))} placeholder="000.000.000-00" inputMode="numeric" maxLength="14" autoComplete="off" />
                {erro && <small>{erro}</small>}
              </label>
              <button className="button button-wide" type="submit" disabled={carregando}>
                {carregando ? 'Consultando...' : 'Consultar situação'}
              </button>
            </form>

            {resultado && (
              <article className={`lookup-result status-${resultado.status}`}>
                <p className="eyebrow">Resultado encontrado</p>
                <h2>{resultado.nome}</h2>
                <span>CPF final {resultado.cpfFinal}</span>
                <strong>{statusLabel[resultado.status] || 'Em análise'}</strong>
                <p>{resultado.observacaoPublica}</p>
              </article>
            )}

            {consultado && !resultado && (
              <div className="lookup-result status-reprovado">
                <p className="eyebrow">Não encontrado</p>
                <h2>CPF não localizado</h2>
                <p>Confira se o número foi digitado corretamente ou faça seu cadastro na pré-lista.</p>
                <Link className="button button-small" to="/pre-lista">Entrar na pré-lista</Link>
              </div>
            )}

            <p className="list-disclaimer">
              A aprovação final poderá exigir documento oficial com foto na entrada. CPF completo, telefone, e-mail e data de nascimento permanecem protegidos.
            </p>
            <Link className="back-link" to="/">← Voltar para o evento</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default ListaPublica
