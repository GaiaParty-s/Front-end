import Icon from './Icons'

function LineUp() {
  return (
    <section className="section lineup" id="line-up">
      <div className="container lineup-grid">
        <div className="section-intro">
          <p className="eyebrow">Curadoria musical</p>
          <h2>O pôr do sol<br /><em>tem comando.</em></h2>
          <p>Hi-Cut está confirmado para conduzir a pista da Sunset Sessions. Uma curadoria pensada para acompanhar o fim de tarde e transformar a noite em uma experiência restrita.</p>
        </div>
        <article className="featured-artist">
          <div className="artist-topline">
            <span>18:00 — 23:00</span>
            <strong>DJ set</strong>
          </div>
          <p>Sunset Sessions apresenta</p>
          <h3>Hi-Cut</h3>
          <div className="artist-footer">
            <span>Curadoria confirmada</span>
            <a className="youtube-link" href="https://youtube.com/@hicuttv?si=Ge2azto-MAOHFoYR" target="_blank" rel="noreferrer">
              Canal do artista <Icon name="arrow" size={15} />
            </a>
          </div>
        </article>
      </div>
    </section>
  )
}

export default LineUp
