import { Link } from 'react-router-dom'
import Icon from './Icons'

function Tickets() {
  return (
    <section className="section tickets" id="ingressos">
      <div className="container">
        <div className="section-intro centered">
          <p className="eyebrow">Acesso limitado</p>
          <h2>Ingressos <em>em breve.</em></h2>
          <p>A Sunset Sessions será uma experiência intimista e restrita. A venda ainda não foi liberada e a disponibilidade será limitada.</p>
        </div>
        <article className="ticket-coming">
          <div className="ticket-icon"><Icon name="ticket" size={25} /></div>
          <div>
            <p>Primeiro acesso</p>
            <h3>Entre na pré-lista</h3>
            <span>Cadastre-se para acompanhar a abertura dos ingressos e receber as próximas informações da edição.</span>
          </div>
          <Link className="button" to="/pre-lista">Quero ser avisado <Icon name="arrow" size={16} /></Link>
        </article>
      </div>
    </section>
  )
}

export default Tickets
