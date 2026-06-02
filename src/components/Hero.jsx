import { Link } from 'react-router-dom'
import banner from '../assets/banner.png'
import Icon from './Icons'

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-glow hero-glow-one" />
      <div className="hero-glow hero-glow-two" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Edição especial · 2026</p>
          <h1>Sunset<br /><em>Sessions</em></h1>
          <p className="hero-subtitle">O pôr do sol encontra a música.</p>
          <div className="event-info">
            <span><Icon name="calendar" size={18} /> Julho 2026</span>
            <span><Icon name="location" size={18} /> São Paulo · SP</span>
          </div>
          <div className="hero-actions">
            <a className="button" href="#ingressos">Garantir ingresso <Icon name="arrow" size={17} /></a>
            <Link className="button button-ghost" to="/pre-lista">Entrar na pré-lista</Link>
          </div>
        </div>
        <div className="hero-art">
          <div className="banner-frame">
            <img src={banner} alt="Banner Sunset Sessions com ondas, pôr do sol e mesa de DJ" />
          </div>
        </div>
      </div>
      <div className="hero-wave" />
    </section>
  )
}

export default Hero
