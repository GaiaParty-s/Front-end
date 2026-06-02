import { Link } from 'react-router-dom'
import { useIngressos } from '../hooks/useCatalogo'
import { formatCurrency } from '../utils/format'
import Icon from './Icons'

function Tickets() {
  const ingressos = useIngressos()
  const availableTickets = ingressos.filter((ticket) => ticket.ativo || ticket.esgotado)

  return (
    <section className="section tickets" id="ingressos">
      <div className="container">
        <div className="section-intro centered">
          <p className="eyebrow">Acesso limitado</p>
          <h2>Ingressos</h2>
          <p>A Sunset Sessions será uma experiência intimista e restrita. A disponibilidade é limitada para preservar a atmosfera da noite.</p>
        </div>
        {availableTickets.length ? (
          <div className="ticket-grid">
            {availableTickets.map((ticket) => (
              <article className={`ticket-card ${ticket.ativo ? 'is-current' : ''} ${ticket.esgotado ? 'is-sold' : ''}`} key={ticket.id}>
                {ticket.ativo && !ticket.esgotado && <span className="ticket-badge">Disponível</span>}
                <div className="ticket-icon"><Icon name="ticket" size={22} /></div>
                <p>{ticket.nome}</p>
                <h3>{formatCurrency(ticket.preco)}</h3>
                <small>{ticket.esgotado ? 'Ingressos esgotados' : `Disponível até ${ticket.dataLimite}`}</small>
                {ticket.esgotado ? (
                  <button className="button button-disabled" disabled>Esgotado</button>
                ) : (
                  <Link className="button" to={`/checkout?tipo=ingresso&id=${ticket.id}`}>Selecionar</Link>
                )}
              </article>
            ))}
          </div>
        ) : (
          <article className="ticket-coming">
            <div className="ticket-icon"><Icon name="ticket" size={25} /></div>
            <div>
              <p>Primeiro acesso</p>
              <h3>Entre na pré-lista</h3>
              <span>Cadastre-se para acompanhar a abertura dos ingressos e receber as próximas informações da edição.</span>
            </div>
            <Link className="button" to="/pre-lista">Quero ser avisado <Icon name="arrow" size={16} /></Link>
          </article>
        )}
      </div>
    </section>
  )
}

export default Tickets
