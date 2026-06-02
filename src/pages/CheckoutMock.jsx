import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer'
import Icon from '../components/Icons'
import Navbar from '../components/Navbar'
import ingressos from '../data/ingressos'
import produtos from '../data/produtos'
import { formatCurrency } from '../utils/format'

function CheckoutMock() {
  const [params] = useSearchParams()
  const [confirmed, setConfirmed] = useState(false)
  const item = useMemo(() => {
    const source = params.get('tipo') === 'produto' ? produtos : ingressos
    return source.find(({ id }) => id === Number(params.get('id'))) || source[0]
  }, [params])
  const isProduct = params.get('tipo') === 'produto'

  return (
    <>
      <Navbar />
      <main className="inner-page">
        <section className="page-hero compact">
          <div className="container">
            <p className="eyebrow">Reserva demonstrativa</p>
            <h1>Finalize sua <em>escolha.</em></h1>
            <p>Esta tela já está preparada para receber a integração de cadastro, estoque e pagamento.</p>
          </div>
        </section>
        <section className="checkout-section">
          <div className="container checkout-grid">
            <div className="checkout-info">
              <p className="eyebrow">Próximos passos</p>
              <h2>Seu sunset começa aqui.</h2>
              <div className="checkout-steps">
                <p><span>1</span> Confirme a sua seleção</p>
                <p><span>2</span> Aguarde a aprovação do cadastro</p>
                <p><span>3</span> Acesse o pagamento externo</p>
              </div>
            </div>
            <article className="order-card">
              <p className="eyebrow">Resumo da reserva</p>
              <div className="order-item">
                <div className="icon-orb"><Icon name={isProduct ? 'glass' : 'ticket'} size={22} /></div>
                <div><small>{isProduct ? item.categoria : 'Ingresso individual'}</small><h3>{item.nome}</h3><p>{isProduct ? item.descricao : `Disponível até ${item.dataLimite}`}</p></div>
              </div>
              <div className="order-total"><span>Total</span><strong>{formatCurrency(item.preco)}</strong></div>
              {confirmed ? (
                <div className="mock-confirmation"><Icon name="check" size={19} /><span>Reserva simulada com sucesso.</span></div>
              ) : (
                <button className="button button-wide" type="button" onClick={() => setConfirmed(true)}>Simular reserva <Icon name="arrow" size={17} /></button>
              )}
              <small className="checkout-disclaimer">Nenhuma cobrança será realizada nesta versão.</small>
            </article>
          </div>
          <div className="container"><Link className="back-link" to="/">← Voltar para o evento</Link></div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default CheckoutMock
