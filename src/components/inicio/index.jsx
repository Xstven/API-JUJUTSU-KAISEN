import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPersonajes } from '../../api'
import './style.css'

const ORDEN = [
  'sin grado', 'grade 4', 'grade 3', 'grade 2', 'semi-grade 1',
  'grade 1', 'semi-special grade', 'special grade',
]

const posicion = (g) => {
  const i = ORDEN.indexOf(g.toLowerCase())
  return i === -1 ? 99 : i
}

function Inicio() {
  const [todos, setTodos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [grado, setGrado] = useState('All')
  const [error, setError] = useState(false) // 1) estado de error
  const navigate = useNavigate()

  useEffect(() => {
    getPersonajes()
      .then(setTodos)
      .catch((e) => {
        console.error('Error:', e)
        setError(true) 
      })
  }, [])

  const grados = [
    'All',
    ...[...new Set(todos.map((p) => p.gradeName))].sort((a, b) => posicion(a) - posicion(b)),
  ]

  const porGrado = grado === 'All'
    ? todos
    : todos.filter((p) => p.gradeName === grado)

  const resultados = busqueda.trim().length >= 3 && isNaN(busqueda)
    ? porGrado.filter((personaje) =>
        personaje.name.toLowerCase().includes(busqueda.toLowerCase())
      )
    : porGrado

  if (error) {
    return (
      <div className="c-estado">
        <p>No se pudo cargar la información. Revisa tu conexión.</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    )
  }

  if (todos.length === 0) return <p>Cargando...</p>

  return (
    <>
      <div className="c-filtro">
        {grados.map((unGrado) => (
          <button
            type="button"
            key={unGrado}
            className={grado === unGrado ? 'activo' : ''}
            onClick={() => setGrado(unGrado)}
          >
            {unGrado}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Buscar personaje"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="c-buscador"
      />

      {resultados.length === 0 && <p>No se encontraron personajes.</p>}

      <div className="c-lista">
        {resultados.map((personaje) => (
          <div
            className="c-lista-pokemon"
            key={personaje.id}
            onClick={() => navigate(`/personaje/${personaje.id}`)}
          >
            <p>{personaje.id}</p>
            <p>{personaje.name}</p>

            {personaje.image && (
              <img
                src={personaje.image}
                alt={personaje.name}
                height="60"
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export default Inicio