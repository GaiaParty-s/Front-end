import About from '../components/About'
import BarProducts from '../components/BarProducts'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import LineUp from '../components/LineUp'
import Navbar from '../components/Navbar'
import Tickets from '../components/Tickets'

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <LineUp />
        <Tickets />
        <BarProducts />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}

export default Home
