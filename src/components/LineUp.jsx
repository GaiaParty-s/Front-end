import Icon from './Icons'

function LineUp() {
  return (
    <section className="section lineup" id="line-up">
      <div className="container lineup-grid">
        <div className="section-intro">
          <p className="eyebrow">Curadoria musical</p>
          <h2>O pôr do sol<br /><em>guarda segredos.</em></h2>
          <p>A pista já tem hora para começar, mas ainda não revelou tudo. Uma experiência cuidadosamente escolhida está tomando forma para conduzir a noite das 18h às 23h.</p>
        </div>
        <article className="featured-artist lineup-teaser">
          <div className="artist-topline">
            <span>18:00 — 23:00</span>
            <strong>Edição limitada</strong>
          </div>
          <p>Sunset Sessions apresenta</p>
          <h3>Em breve</h3>
          <div className="artist-footer">
            <span>Curadoria especial</span>
            <span className="youtube-link is-disabled">Novidades a caminho <Icon name="arrow" size={15} /></span>
          </div>
        </article>
      </div>
    </section>
  )
}

export default LineUp
