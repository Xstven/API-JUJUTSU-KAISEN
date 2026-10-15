import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'

import Inicio from './components/inicio'
import Coleccion from './components/Coleccion'
import Favoritos from './components/Favoritos'
import Info from './components/Info'
import Usuario from './components/Usuario'
import Personajes from './components/Personajes'
import './App.css'

function App() {
  return (
    <Router>
      <nav className="c-menu">
        <Link to="/">Inicio</Link>
        <Link to="/coleccion">Coleccion</Link>
        <Link to="/favoritos">Favoritos</Link>
        <Link to="/info">Info</Link>
        <Link to="/usuario">Usuarios</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/coleccion" element={<Coleccion />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/info" element={<Info />} />
        <Route path="/usuario" element={<Usuario />} />
        <Route path="personaje/:id" element={<Personajes />} />
      </Routes>
    </Router>
  )
}

export default App