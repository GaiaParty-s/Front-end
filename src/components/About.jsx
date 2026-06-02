import Icon from './Icons'

const highlights = [
  ['sun', 'Sunset Experience', 'Uma atmosfera desenhada para o fim de tarde.'],
  ['music', 'DJs convidados', 'Sets envolventes do entardecer à noite.'],
  ['glass', 'Bar selecionado', 'Garrafas e combos escolhidos a dedo.'],
  ['star', 'Local exclusivo', 'Uma edição intimista em São Paulo.'],
]

function About() {
  return (
    <section className="section about" id="sobre">
      <div className="container">
        <div className="section-intro centered">
          <p className="eyebrow">Viva o momento</p>
          <h2>Mais que uma festa,<br /><em>uma experiência.</em></h2>
          <p>Quando o céu ganha tons dourados, a música assume o ritmo. Uma celebração intimista para sentir, brindar e guardar na memória.</p>
        </div>
        <div className="highlight-grid">
          {highlights.map(([icon, title, text]) => (
            <article className="highlight-card" key={title}>
              <div className="icon-orb"><Icon name={icon} size={24} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
