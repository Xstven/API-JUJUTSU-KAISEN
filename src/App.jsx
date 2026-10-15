import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom'

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
        <NavLink to="/" end>Inicio</NavLink>
        <NavLink to="/coleccion">Coleccion</NavLink>
        <NavLink to="/favoritos">Favoritos</NavLink>
        <NavLink to="/info">Info</NavLink>
        <NavLink to="/usuario">Usuarios</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/coleccion" element={<Coleccion />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/info" element={<Info />} />
        <Route path="/usuario" element={<Usuario />} />
        <Route path="/personaje/:id" element={<Personajes />} />
      </Routes>
    </Router>
  )
}

export default App