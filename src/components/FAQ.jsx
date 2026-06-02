import { useState } from 'react'

const questions = [
  ['Qual é a idade mínima para entrar?', 'A entrada e o consumo de bebidas são permitidos somente para maiores de 18 anos. Leve um documento oficial com foto.'],
  ['Como funciona a pré-lista?', 'Você envia seus dados para uma aprovação inicial. Nesta versão demonstrativa, o cadastro é apenas simulado.'],
  ['Quais são as formas de pagamento?', 'O checkout definitivo terá integração com pagamento externo. Por enquanto, a confirmação exibida é demonstrativa.'],
  ['Preciso apresentar comprovante?', 'Sim. Após a futura confirmação de pagamento, o comprovante digital será enviado para o e-mail cadastrado.'],
  ['Como retiro os produtos reservados no bar?', 'As reservas aprovadas poderão ser retiradas durante o evento no balcão do Bar Sunset mediante identificação.'],
]

function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section className="section faq">
      <div className="container faq-grid">
        <div className="section-intro">
          <p className="eyebrow">Dúvidas frequentes</p>
          <h2>Antes do<br /><em>sunset.</em></h2>
          <p>Tudo o que você precisa saber para curtir a experiência.</p>
        </div>
        <div className="accordion">
          {questions.map(([question, answer], index) => (
            <article className={`faq-item ${open === index ? 'is-open' : ''}`} key={question}>
              <button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}>
                <span>{question}</span><strong>{open === index ? '−' : '+'}</strong>
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
