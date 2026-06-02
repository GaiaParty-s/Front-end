import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/format'

const initials = (name) => name.split(' ').map((word) => word[0]).slice(0, 2).join('')

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className={`product-image category-${product.categoria.toLowerCase().replace('é', 'e')}`}>
        <span>{initials(product.nome)}</span>
        <img src={product.imagem} alt={product.nome} onError={(event) => { event.currentTarget.style.display = 'none' }} />
      </div>
      <div className="product-content">
        <div className="product-meta">
          <span>{product.categoria}</span>
          <small className={product.estoque <= 5 ? 'low-stock' : ''}>{product.estoque <= 5 ? 'Últimas unidades' : 'Em estoque'}</small>
        </div>
        <h3>{product.nome}</h3>
        <p>{product.descricao}</p>
        {product.itens && (
          <ul className="combo-list">
            {product.itens.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}
        <div className="product-bottom">
          <strong>{formatCurrency(product.preco)}</strong>
          <Link className="button button-small" to={`/checkout?tipo=produto&id=${product.id}`}>Reservar</Link>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
