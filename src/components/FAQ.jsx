import { useState } from 'react'

const questions = [
  ['Qual e a idade minima para entrar?', 'A entrada e permitida para quem tera 16 anos ou mais na data do evento. Bebidas alcoolicas sao somente para maiores de 18 anos. Leve documento oficial com foto.'],
  ['Como funciona a pre-lista?', 'Voce envia seus dados para acompanhar a abertura dos ingressos. Como a edicao e restrita e limitada, entrar na lista e a melhor forma de receber as proximas informacoes.'],
  ['Os ingressos ja estao disponiveis?', 'Ainda nao. A venda sera aberta em breve e a disponibilidade sera limitada. Entre na pre-lista para acompanhar as novidades.'],
  ['Preciso apresentar comprovante?', 'Sim. Apos a futura confirmacao de pagamento, o comprovante digital sera enviado para o e-mail cadastrado.'],
  ['Onde e quando acontece a Sunset Sessions?', 'No dia 04 de julho de 2026, das 18h as 23h, na Rua Lira Cearense, 400, no salao de festas.'],
]

function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section className="section faq">
      <div className="container faq-grid">
        <div className="section-intro">
          <p className="eyebrow">Duvidas frequentes</p>
          <h2>Antes do<br /><em>sunset.</em></h2>
          <p>Tudo o que voce precisa saber para curtir a experiencia.</p>
        </div>
        <div className="accordion">
          {questions.map(([question, answer], index) => (
            <article className={`faq-item ${open === index ? 'is-open' : ''}`} key={question}>
              <button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}>
                <span>{question}</span><strong>{open === index ? '-' : '+'}</strong>
              </button>
              {open === index && <p>{answer}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
