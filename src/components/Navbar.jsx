import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const homePrefix = pathname === '/' ? '' : '/'
  const closeMenu = () => setOpen(false)

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="brand-sun">
            <img src="/icon.png" alt="" />
          </span>
          <span>Sunset <em>Sessions</em></span>
        </Link>
        <button className={`menu-toggle ${open ? 'is-open' : ''}`} type="button" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span />
          <span />
          <span />
        </button>
        <nav className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Navegação principal">
          <a href={`${homePrefix}#sobre`} onClick={closeMenu}>Sobre</a>
          <a href={`${homePrefix}#line-up`} onClick={closeMenu}>Line-up</a>
          <a href={`${homePrefix}#ingressos`} onClick={closeMenu}>Ingressos</a>
          <a href={`${homePrefix}#bar`} onClick={closeMenu}>Bar</a>
          <Link to="/lista" onClick={closeMenu}>Lista</Link>
          <a href={`${homePrefix}#contato`} onClick={closeMenu}>Contato</a>
          <Link className="button button-small" to="/pre-lista" onClick={closeMenu}>Entrar na pré-lista</Link>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
