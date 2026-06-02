import { Link } from 'react-router-dom'
import icon from '../assets/icon.png'

function Footer() {
  return (
    <footer className="footer" id="contato">
      <div className="container footer-grid">
        <div>
          <Link className="brand" to="/">
            <span className="brand-sun">
              <img src={icon} alt="" />
            </span>
            <span>Sunset <em>Sessions</em></span>
          </Link>
          <p>O pôr do sol encontra a música.<br />São Paulo · Julho 2026</p>
        </div>
        <div>
          <h4>Explore</h4>
          <a href="/#sobre">Sobre</a>
          <a href="/#line-up">Line-up</a>
          <a href="/#ingressos">Ingressos</a>
        </div>
        <div>
          <h4>Mais</h4>
          <a href="/#bar">Bar Sunset</a>
          <Link to="/pre-lista">Pré-lista</Link>
          <a href="mailto:contato@sunsetsessions.com.br">Contato</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Sunset Sessions</span>
        <span>Feito para celebrar bons momentos.</span>
      </div>
    </footer>
  )
}

export default Footer
