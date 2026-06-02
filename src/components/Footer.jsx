import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer" id="contato">
      <div className="container footer-grid">
        <div>
          <Link className="brand" to="/">
            <span className="brand-sun">
              <img src="/icon.png" alt="" />
            </span>
            <span>Sunset <em>Sessions</em></span>
          </Link>
          <p>O pôr do sol encontra a música.<br />04 de julho de 2026 · 18h às 23h<br />Rua Lira Cearense, 400 · Salão de festas</p>
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
          <a href="https://chat.whatsapp.com/IEC8hUbzq76LcflTzzPb8i?s=cl&p=i&mlu=0">Contato</a>
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
