import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer'
import Icon from '../components/Icons'
import MercadoPagoPaymentBrick from '../components/MercadoPagoPaymentBrick'
import Navbar from '../components/Navbar'
import { useIngressos, useProdutos } from '../hooks/useCatalogo'
import { consultarPagamentoMercadoPago, criarPagamentoMercadoPago, criarSessaoPaymentBrick } from '../services/pagamentos'
import { formatCurrency } from '../utils/format'

const onlyDigits = (value) => value.replace(/\D/g, '')

const formatCpf = (value) =>
  onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

const hasPaymentBrick = Boolean(import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY)
const whatsappNumber = '5511962687827'

const paymentFees = [
  { label: 'Cartao de credito a vista', detail: 'Na hora', feeLabel: '4,98%', rate: 0.0498 },
  { label: 'Pix no QrCode', detail: 'Confirmacao na hora', feeLabel: '0,99%', rate: 0.0099 },
  { label: 'Boleto', detail: '3 dias', feeLabel: 'R$ 3,49', fixedFee: 3.49 },
  { label: 'Pix no privado', detail: 'Confirmacao manual via WhatsApp', feeLabel: '0,00%', rate: 0, highlighted: true },
]

const applyFee = (amount, fee) => amount + (fee.fixedFee || amount * fee.rate)

function CheckoutMock() {
  const [params] = useSearchParams()
  const [cpf, setCpf] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)
  const [paymentResult, setPaymentResult] = useState(null)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const produtos = useProdutos()
  const ingressos = useIngressos()
  const isProduct = params.get('tipo') === 'produto'
  const item = useMemo(() => {
    const source = isProduct ? produtos : ingressos
    return source.find(({ id }) => String(id) === params.get('id')) || source[0]
  }, [ingressos, isProduct, params, produtos])
  const total = Number(item?.preco || 0) * quantidade
  const unavailable = !item || item.ativo === false || item.esgotado === true
  const pixData = paymentResult?.transactionData || paymentResult?.pointOfInteraction?.transaction_data || null
  const statusLabel = paymentResult?.status ? paymentResult.status.toUpperCase() : ''
  const pixTotal = applyFee(total, paymentFees.find((fee) => fee.highlighted))

  const pixWhatsappUrl = useMemo(() => {
    const message = [
      'Oi, quero pagar no Pix e confirmar meu pedido no privado.',
      `Tipo: ${isProduct ? 'Produto' : 'Ingresso'}`,
      `Item: ${item?.nome || ''}`,
      `Quantidade: ${quantidade}`,
      `CPF: ${cpf || 'nao informado'}`,
      `Subtotal: ${formatCurrency(total)}`,
      `Total no Pix privado sem taxa: ${formatCurrency(pixTotal)}`,
    ].join('\n')

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }, [cpf, isProduct, item, pixTotal, quantidade, total])

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
    setCheckingPayment(false)
  }

  const handleCheckPayment = async () => {
    if (!paymentResult?.id && !paymentResult?.paymentId) {
      setError('Nao encontrei um pagamento para consultar.')
      return
    }

    setCheckingPayment(true)
    setError('')

    try {
      const payment = await consultarPagamentoMercadoPago({
        paymentId: String(paymentResult.paymentId || paymentResult.id),
        pedidoId: session?.pedidoId || paymentResult?.pedidoId,
      })

      setPaymentResult((current) => ({
        ...current,
        ...payment,
      }))

      if (payment.status === 'approved') {
        setError('')
      }
    } catch (checkError) {
      setError(checkError.message)
    } finally {
      setCheckingPayment(false)
    }
  }

  const handlePixCheckout = () => {
    if (onlyDigits(cpf).length !== 11) {
      setError('Informe o CPF antes de chamar no WhatsApp para Pix.')
      return
    }

    window.open(pixWhatsappUrl, '_blank', 'noopener,noreferrer')
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
                <p><span>3</span> Escolha cartao, boleto ou fale no WhatsApp para Pix</p>
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
              <div className="order-total"><span>Subtotal</span><strong>{formatCurrency(total)}</strong></div>
              <div className="fee-panel" aria-label="Taxas por forma de pagamento">
                <div className="fee-panel-head">
                  <div>
                    <p className="eyebrow">Taxas transparentes</p>
                    <strong>O total final muda conforme o metodo escolhido.</strong>
                  </div>
                </div>
                <div className="fee-list">
                  {paymentFees.map((fee) => (
                    <div className={`fee-row ${fee.highlighted ? 'is-highlighted' : ''}`} key={fee.label}>
                      <div>
                        <span>{fee.label}</span>
                        <small>{fee.detail}</small>
                      </div>
                      <div>
                        <strong>{fee.feeLabel}</strong>
                        <small>{formatCurrency(applyFee(total, fee))}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <p>As taxas sao exibidas antes da escolha da forma de pagamento. No Pix, a confirmacao e feita no privado sem taxa e o pedido e marcado como pago manualmente pela organizacao.</p>
              </div>
              {error && <div className="form-error-message">{error}</div>}
              {paymentResult && (
                <div className="mock-confirmation">
                  <Icon name="check" size={19} />
                  <span>Pagamento {statusLabel || paymentResult.status}. Pedido {paymentResult.id}.</span>
                </div>
              )}
              {pixData?.qr_code && (
                <div className="pix-box">
                  <p className="eyebrow">Pix gerado</p>
                  <small>Copie o codigo ou use a imagem para concluir o pagamento.</small>
                  <textarea readOnly value={pixData.qr_code} />
                  {pixData.qr_code_base64 && (
                    <img alt="QR Code Pix" className="pix-qr" src={`data:image/png;base64,${pixData.qr_code_base64}`} />
                  )}
                  <button className="button button-wide button-outline pix-check" disabled={checkingPayment} type="button" onClick={handleCheckPayment}>
                    {checkingPayment ? 'Consultando pagamento...' : 'Verificar pagamento no Mercado Pago'} <Icon name="arrow" size={17} />
                  </button>
                </div>
              )}
              {unavailable ? (
                <div className="mock-unavailable"><Icon name="ticket" size={18} /><span>Este item nao esta disponivel para compra.</span></div>
              ) : session ? (
                <>
                  <button className="button button-wide button-outline pix-whatsapp" type="button" onClick={handlePixCheckout}>
                    Pagar no Pix pelo WhatsApp <Icon name="arrow" size={17} />
                  </button>
                  <MercadoPagoPaymentBrick
                    session={session}
                    onError={setError}
                    onPayment={setPaymentResult}
                  />
                </>
              ) : (
                <div className="checkout-actions">
                  <button className="button button-wide button-outline" type="button" onClick={handlePixCheckout}>
                    Pagar no Pix pelo WhatsApp <Icon name="arrow" size={17} />
                  </button>
                  <button className="button button-wide" disabled={loading} type="submit">{loading ? 'Validando CPF...' : 'Continuar para Mercado Pago'} <Icon name="arrow" size={17} /></button>
                </div>
              )}
              <small className="checkout-disclaimer">{hasPaymentBrick ? 'Os dados sensiveis do pagamento sao processados pelo Mercado Pago; o site nao armazena dados de cartao. Pix e tratado no WhatsApp para confirmacao manual.' : 'O pagamento sera aberto no checkout seguro do Mercado Pago ate a chave publica do checkout embutido ser configurada. Pix e tratado no WhatsApp para confirmacao manual.'}</small>
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
