import Icon from './Icons'

const youtubeChannelUrl = 'https://youtube.com/@hicuttv?si=Ge2azto-MAOHFoYR'

function LineUp() {
  return (
    <section className="section lineup" id="line-up">
      <div className="container lineup-grid">
        <div className="section-intro">
          <p className="eyebrow">Curadoria musical</p>
          <h2>Uma noite.<br /><em>Um artista.</em></h2>
          <p>Sem trocas apressadas ou distrações. Das 19h às 23h, Hi-Cut conduz a pista em uma jornada pensada para acompanhar cada fase da noite.</p>
        </div>
        <article className="featured-artist">
          <div className="artist-topline">
            <span>19:00 — 23:00</span>
            <strong>Exclusive set</strong>
          </div>
          <p>Sunset Sessions apresenta</p>
          <h3>Hi-Cut</h3>
          <div className="artist-footer">
            <span>All night long</span>
            {youtubeChannelUrl ? (
              <a className="youtube-link" href={youtubeChannelUrl} target="_blank" rel="noreferrer">Ouvir no YouTube <Icon name="arrow" size={15} /></a>
            ) : (
              <span className="youtube-link is-disabled">Canal no YouTube · em breve</span>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}

export default LineUp
