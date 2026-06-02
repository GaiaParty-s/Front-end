import { Link } from 'react-router-dom'
import ingressos from '../data/ingressos'
import { formatCurrency } from '../utils/format'
import Icon from './Icons'

function Tickets() {
  return (
    <section className="section tickets" id="ingressos">
      <div className="container">
        <div className="section-intro centered">
          <p className="eyebrow">Escolha seu acesso</p>
          <h2>Ingressos</h2>
          <p>Garanta seu lugar antes que o sol se ponha.</p>
        </div>
        <div className="ticket-grid">
          {ingressos.map((ticket) => (
            <article className={`ticket-card ${ticket.ativo ? 'is-current' : ''} ${ticket.esgotado ? 'is-sold' : ''}`} key={ticket.id}>
              {ticket.ativo && <span className="ticket-badge">Lote atual</span>}
              <div className="ticket-icon"><Icon name="ticket" size={22} /></div>
              <p>{ticket.nome}</p>
              <h3>{formatCurrency(ticket.preco)}</h3>
              <small>{ticket.esgotado ? 'Ingressos esgotados' : `Disponível até ${ticket.dataLimite}`}</small>
              {ticket.esgotado ? (
                <button className="button button-disabled" disabled>Esgotado</button>
              ) : (
                <Link className={`button ${ticket.ativo ? '' : 'button-outline'}`} to={`/checkout?tipo=ingresso&id=${ticket.id}`}>Comprar</Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Tickets
