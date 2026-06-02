const artists = [
  ['18:00', 'Warm-up', 'DJ Luiza Prado'],
  ['20:00', 'Sunset Set', 'Caio Mendes'],
  ['22:00', 'Night Session', 'Bella Mar'],
]

function LineUp() {
  return (
    <section className="section lineup" id="line-up">
      <div className="container lineup-grid">
        <div className="section-intro">
          <p className="eyebrow">Curadoria musical</p>
          <h2>Line-up para<br /><em>sentir o momento.</em></h2>
          <p>Do primeiro brinde ao último beat, uma seleção de artistas para acompanhar cada fase do pôr do sol.</p>
        </div>
        <div className="lineup-list">
          {artists.map(([time, set, artist]) => (
            <article className="artist-row" key={time}>
              <span>{time}</span>
              <div><small>{set}</small><h3>{artist}</h3></div>
              <strong>SS</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LineUp
