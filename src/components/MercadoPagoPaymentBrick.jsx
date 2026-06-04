import { initMercadoPago, Payment } from '@mercadopago/sdk-react'
import { useMemo } from 'react'
import { processarPaymentBrick } from '../services/pagamentos'

const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY

if (publicKey) {
  initMercadoPago(publicKey, { locale: 'pt-BR' })
}

function MercadoPagoPaymentBrick({ session, onError, onPayment }) {
  const initialization = useMemo(() => ({
    amount: session.amount,
    payer: {
      email: session.comprador.email,
      identification: {
        type: 'CPF',
        number: session.comprador.cpf,
      },
    },
  }), [session])

  const customization = useMemo(() => ({
    paymentMethods: {
      bankTransfer: 'pix',
      creditCard: 'all',
      debitCard: 'all',
      ticket: 'all',
    },
  }), [])

  if (!publicKey) {
    return <div className="form-error-message">Chave publica do Mercado Pago nao configurada.</div>
  }

  return (
    <div className="payment-brick-shell">
      <Payment
        initialization={initialization}
        customization={customization}
        onError={(brickError) => {
          console.error(brickError)
          onError('Nao foi possivel carregar o checkout do Mercado Pago.')
        }}
        onSubmit={({ formData }) =>
          processarPaymentBrick({ pedidoId: session.pedidoId, formData })
            .then((payment) => {
              onPayment(payment)
              return payment
            })
            .catch((paymentError) => {
              onError(paymentError.message)
              throw paymentError
            })
        }
      />
    </div>
  )
}

export default MercadoPagoPaymentBrick
