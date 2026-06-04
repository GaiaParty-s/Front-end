import { Link, useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer'
import Icon from '../components/Icons'
import Navbar from '../components/Navbar'

const messages = {
  sucesso: {
    title: 'Pagamento recebido.',
    text: 'Seu pedido foi enviado para confirmacao. Assim que o Mercado Pago notificar o sistema, o status final fica registrado.',
    icon: 'check',
  },
  pendente: {
    title: 'Pagamento pendente.',
    text: 'O Mercado Pago ainda esta processando a transacao. Boletos, Pix e analises podem levar alguns instantes.',
    icon: 'ticket',
  },
  falha: {
    title: 'Pagamento nao concluido.',
    text: 'A transacao nao foi aprovada ou foi cancelada. Voce pode voltar e tentar novamente.',
    icon: 'arrow',
  },
}

function CheckoutReturn() {
  const [params] = useSearchParams()
  const status = params.get('status') || 'pendente'
  const pedido = params.get('pedido')
  const message = messages[status] || messages.pendente

  return (
    <>
      <Navbar />
      <main className="inner-page">
        <section className="page-hero compact">
          <div className="container">
            <p className="eyebrow">Mercado Pago</p>
            <h1>{message.title}</h1>
            <p>{message.text}</p>
          </div>
        </section>
        <section className="checkout-section">
          <article className="order-card lookup-card narrow-container">
            <div className="mock-confirmation">
              <Icon name={message.icon} size={19} />
              <span>{pedido ? `Pedido ${pedido}` : 'Pedido em processamento'}</span>
            </div>
            <Link className="button button-wide back-link-button" to="/">Voltar para o evento</Link>
          </article>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default CheckoutReturn
