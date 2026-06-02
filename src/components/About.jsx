import Icon from './Icons'

const highlights = [
  ['sun', 'Sunset Experience', 'Uma atmosfera desenhada para o fim de tarde.'],
  ['music', 'Curadoria em segredo', 'A trilha da noite ainda guarda algumas surpresas.'],
  ['glass', 'Bar selecionado', 'Garrafas e combos escolhidos a dedo.'],
  ['star', 'Acesso limitado', 'Uma edição intimista, restrita e com poucos convidados.'],
]

function About() {
  return (
    <section className="section about" id="sobre">
      <div className="container">
        <div className="section-intro centered">
          <p className="eyebrow">Viva o momento</p>
          <h2>Mais que uma festa,<br /><em>uma experiência.</em></h2>
          <p>Uma noite cuidadosamente limitada para quem valoriza boa música, bons encontros e uma atmosfera mais reservada. Poucos convidados, quatro horas de experiência e espaço para aproveitar cada momento.</p>
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
