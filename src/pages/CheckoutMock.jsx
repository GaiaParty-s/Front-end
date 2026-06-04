import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer'
import Icon from '../components/Icons'
import MercadoPagoPaymentBrick from '../components/MercadoPagoPaymentBrick'
import Navbar from '../components/Navbar'
import { useIngressos, useProdutos } from '../hooks/useCatalogo'
import { criarPagamentoMercadoPago, criarSessaoPaymentBrick } from '../services/pagamentos'
import { formatCurrency } from '../utils/format'

const onlyDigits = (value) => value.replace(/\D/g, '')

const formatCpf = (value) =>
  onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

const hasPaymentBrick = Boolean(import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY)

function CheckoutMock() {
  const [params] = useSearchParams()
  const [cpf, setCpf] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)
  const [paymentResult, setPaymentResult] = useState(null)
  const produtos = useProdutos()
  const ingressos = useIngressos()
  const isProduct = params.get('tipo') === 'produto'
  const item = useMemo(() => {
    const source = isProduct ? produtos : ingressos
    return source.find(({ id }) => String(id) === params.get('id')) || source[0]
  }, [ingressos, isProduct, params, produtos])
  const total = Number(item?.preco || 0) * quantidade
  const unavailable = !item || item.ativo === false || item.esgotado === true

  const handleCheckout = async (event) => {
    event.preventDefault()
    setError('')

    if (onlyDigits(cpf).length !== 11) {
      setError('Informe um CPF valido para continuar.')
      return
    }

    setLoading(true)

    try {
      if (!hasPaymentBrick) {
        const payment = await criarPagamentoMercadoPago({
          tipo: isProduct ? 'produto' : 'ingresso',
          id: item.id,
          quantidade,
          cpf: onlyDigits(cpf),
        })

        window.location.href = payment.initPoint
        return
      }

      const checkoutSession = await criarSessaoPaymentBrick({
        tipo: isProduct ? 'produto' : 'ingresso',
        id: item.id,
        quantidade,
        cpf: onlyDigits(cpf),
      })

      setSession(checkoutSession)
    } catch (checkoutError) {
      setError(checkoutError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCpfChange = (event) => {
    setCpf(formatCpf(event.target.value))
    setError('')
    setSession(null)
    setPaymentResult(null)
  }

  return (
    <>
      <Navbar />
      <main className="inner-page">
        <section className="page-hero compact">
          <div className="container">
            <p className="eyebrow">Checkout seguro</p>
            <h1>Finalize sua <em>escolha.</em></h1>
            <p>Confirme seu CPF e pague diretamente no site com a seguranca do Mercado Pago.</p>
          </div>
        </section>
        <section className="checkout-section">
          <div className="container checkout-grid">
            <div className="checkout-info">
              <p className="eyebrow">Proximos passos</p>
              <h2>Seu sunset comeca aqui.</h2>
              <div className="checkout-steps">
                <p><span>1</span> Confirme a sua selecao</p>
                <p><span>2</span> Confirme seu CPF da pre-lista</p>
                <p><span>3</span> Escolha Pix, cartao ou boleto</p>
              </div>
            </div>
            <form className="order-card" onSubmit={handleCheckout}>
              <p className="eyebrow">Resumo da reserva</p>
              <div className="order-item">
                <div className="icon-orb"><Icon name={isProduct ? 'glass' : 'ticket'} size={22} /></div>
                <div>
                  <small>{isProduct ? item?.categoria : 'Ingresso individual'}</small>
                  <h3>{item?.nome}</h3>
                  <p>{isProduct ? item?.descricao : `Disponivel ate ${item?.dataLimite}`}</p>
                </div>
              </div>
              <div className="field checkout-quantity">
                <span>Quantidade</span>
                <input
                  min="1"
                  max="10"
                  name="quantidade"
                  type="number"
                  value={quantidade}
                  onChange={(event) => {
                    setQuantidade(Math.max(1, Math.min(Number(event.target.value) || 1, 10)))
                    setSession(null)
                    setPaymentResult(null)
                  }}
                />
              </div>
              <label className="field">
                <span>CPF cadastrado na pre-lista</span>
                <input
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength="14"
                  name="cpf"
                  placeholder="000.000.000-00"
                  required
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                />
              </label>
              <div className="order-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
              {error && <div className="form-error-message">{error}</div>}
              {paymentResult && (
                <div className="mock-confirmation">
                  <Icon name="check" size={19} />
                  <span>Pagamento {paymentResult.status}. Pedido {paymentResult.id}.</span>
                </div>
              )}
              {unavailable ? (
                <div className="mock-unavailable"><Icon name="ticket" size={18} /><span>Este item nao esta disponivel para compra.</span></div>
              ) : session ? (
                <MercadoPagoPaymentBrick
                  session={session}
                  onError={setError}
                  onPayment={setPaymentResult}
                />
              ) : (
                <button className="button button-wide" disabled={loading} type="submit">{loading ? 'Validando CPF...' : 'Continuar para pagamento'} <Icon name="arrow" size={17} /></button>
              )}
              <small className="checkout-disclaimer">{hasPaymentBrick ? 'Os dados sensiveis do pagamento sao processados pelo Mercado Pago; o site nao armazena dados de cartao.' : 'O pagamento sera aberto no checkout seguro do Mercado Pago ate a chave publica do checkout embutido ser configurada.'}</small>
            </form>
          </div>
          <div className="container"><Link className="back-link" to="/">Voltar para o evento</Link></div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default CheckoutMock
