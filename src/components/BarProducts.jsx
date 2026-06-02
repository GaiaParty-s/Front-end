import { useState } from 'react'
import { useProdutos } from '../hooks/useCatalogo'
import ProductCard from './ProductCard'

const filters = [
  ['Todos', 'Todos'],
  ['Vodkas', 'Vodka'],
  ['Whiskys', 'Whisky'],
  ['Licores', 'Licor'],
  ['Energéticos', 'Energético'],
  ['Combos', 'Combo'],
]

function BarProducts() {
  const [activeFilter, setActiveFilter] = useState('Todos')
  const produtos = useProdutos()
  const availableProducts = produtos.filter((product) => product.ativo && (activeFilter === 'Todos' || product.categoria === activeFilter))

  return (
    <section className="section bar-products" id="bar">
      <div className="container">
        <div className="section-heading-row">
          <div className="section-intro">
            <p className="eyebrow">Reserve com antecedência</p>
            <h2>Bar <em>Sunset</em></h2>
            <p>Garrafas, combos e produtos selecionados para reservar antes da festa.</p>
          </div>
          <p className="bar-note">Retire sua reserva no bar durante o evento.</p>
        </div>
        <div className="filter-row" role="tablist" aria-label="Filtrar produtos">
          {filters.map(([label, value]) => (
            <button className={activeFilter === value ? 'is-active' : ''} type="button" role="tab" aria-selected={activeFilter === value} onClick={() => setActiveFilter(value)} key={value}>{label}</button>
          ))}
        </div>
        <div className="product-grid">
          {availableProducts.map((product) => <ProductCard product={product} key={product.id} />)}
        </div>
        <p className="age-warning">Venda e consumo permitidos apenas para maiores de 18 anos. Aprecie com moderação.</p>
      </div>
    </section>
  )
}

export default BarProducts
