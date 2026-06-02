import { Route, Routes } from 'react-router-dom'
import CheckoutMock from '../pages/CheckoutMock'
import Home from '../pages/Home'
import ListaPublica from '../pages/ListaPublica'
import PreLista from '../pages/PreLista'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pre-lista" element={<PreLista />} />
      <Route path="/lista" element={<ListaPublica />} />
      <Route path="/checkout" element={<CheckoutMock />} />
    </Routes>
  )
}

export default AppRoutes
