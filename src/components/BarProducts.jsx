import { useMemo, useState } from 'react'
import { useProdutos } from '../hooks/useCatalogo'
import ProductCard from './ProductCard'

function BarProducts() {
  const [activeFilter, setActiveFilter] = useState('Todos')
  const produtos = useProdutos()
  const activeProducts = useMemo(() => produtos.filter((product) => product.ativo), [produtos])
  const filters = useMemo(() => {
    const categories = activeProducts
      .map((product) => product.categoria)
      .filter((categoria, index, list) => categoria && list.indexOf(categoria) === index)

    return ['Todos', ...categories]
  }, [activeProducts])
  const selectedFilter = filters.includes(activeFilter) ? activeFilter : 'Todos'
  const availableProducts = activeProducts.filter((product) => selectedFilter === 'Todos' || product.categoria === selectedFilter)

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
          {filters.map((filter) => (
            <button className={selectedFilter === filter ? 'is-active' : ''} type="button" role="tab" aria-selected={selectedFilter === filter} onClick={() => setActiveFilter(filter)} key={filter}>{filter}</button>
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
