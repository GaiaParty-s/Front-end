import { Link } from 'react-router-dom'
import Icon from './Icons'

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-glow hero-glow-one" />
      <div className="hero-glow hero-glow-two" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Edição limitada · 2026</p>
          <h1>Sunset<br /><em>Sessions</em></h1>
          <p className="hero-subtitle">O pôr do sol encontra a música.</p>
          <div className="event-info">
            <span><Icon name="calendar" size={18} /> 04 de julho · 18h às 23h</span>
            <span><Icon name="location" size={18} /> Rua Lira Cearense, 400</span>
          </div>
          <div className="hero-actions">
            <Link className="button" to="/pre-lista">Entrar na pré-lista <Icon name="arrow" size={17} /></Link>
            <a className="button button-ghost" href="#ingressos">Garanta já seu ingresso!</a>
          </div>
        </div>
        <div className="hero-art">
          <div className="banner-frame">
            <img src="/banner.png" alt="Banner Sunset Sessions com ondas, pôr do sol e mesa de DJ" />
          </div>
        </div>
      </div>
      <div className="hero-wave" />
    </section>
  )
}

export default Hero
