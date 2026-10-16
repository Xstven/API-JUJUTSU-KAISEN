import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPersonajes, getTitanes } from '../../api'
import './style.css'

// Orden de los filtros por estado
const ORDEN = ['alive', 'deceased', 'unknown']

const ETIQUETAS = {
  All: 'Todos',
  Alive: 'Vivo',
  Deceased: 'Fallecido',
  Unknown: 'Desconocido',
  Titanes: 'Titanes',
}

const posicion = (e) => {
  const i = ORDEN.indexOf(e.toLowerCase())
  return i === -1 ? 99 : i
}

// Si no trae foto (o la imagen falla), se muestra un recuadro con "?"
function Foto({ src, alt }) {
  const [falla, setFalla] = useState(false)
  if (!src || falla) return <div className="c-sinfoto">?</div>
  return <img src={src} alt={alt} loading="lazy" onError={() => setFalla(true)} />
}

function DetalleTitan({ titan, onCerrar }) {
  const anteriores = titan.herederosAnteriores.map((h) => h.name)

  // Escape cierra la ventana y se bloquea el scroll de la página de fondo
  useEffect(() => {
    const alTeclear = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', alTeclear)
    const antes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = antes
    }
  }, [onCerrar])

  return (
    <div className="c-modal" onClick={onCerrar}>
      <div className="c-modal-caja" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="c-modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M5 5l14 14M19 5L5 19"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>

        <Foto src={titan.image} alt={titan.name} />
        <h2>{titan.name}</h2>
        {titan.allegiance && <span className="c-modal-etiqueta">{titan.allegiance}</span>}

        <div className="c-modal-datos">
          <div>
            <small>Altura</small>
            <strong>{titan.height ?? 'N/D'}</strong>
          </div>
          <div>
            <small>Portador actual</small>
            <strong>{titan.herederoActual?.name ?? 'Ninguno'}</strong>
          </div>
          <div>
            <small>Portadores anteriores</small>
            <strong>{anteriores.length}</strong>
          </div>
        </div>

        {anteriores.length > 0 && (
          <p className="c-modal-nota">Anteriores: {anteriores.join(', ')}</p>
        )}

        <h3>Habilidades</h3>
        {titan.abilities.length ? (
          <div className="c-modal-chips">
            {titan.abilities.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
        ) : (
          <p className="c-modal-nota">Sin habilidades registradas.</p>
        )}
      </div>
    </div>
  )
}

function Inicio() {
  const [todos, setTodos] = useState([])
  const [titanes, setTitanes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('All')
  const [titanElegido, setTitanElegido] = useState(null)
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getPersonajes()
      .then(setTodos)
      .catch((e) => {
        console.error('Error:', e)
        setError(true)
      })
    // Si fallan los titanes, la lista de personajes sigue funcionando
    getTitanes()
      .then(setTitanes)
      .catch((e) => console.error('Titanes:', e))
  }, [])

  const estados = [
    'All',
    ...[...new Set(todos.map((p) => p.gradeName))].sort((a, b) => posicion(a) - posicion(b)),
    ...(titanes.length ? ['Titanes'] : []),
  ]

  const verTitanes = estado === 'Titanes'

  // Se marcan los titanes porque sus ids se repiten con los de los personajes
  const titanesLista = titanes.map((t) => ({ ...t, esTitan: true }))

  const base = verTitanes
    ? titanesLista
    : estado === 'All'
      ? todos
      : todos.filter((p) => p.gradeName === estado)

  const resultados = busqueda.trim().length >= 3 && isNaN(busqueda)
    ? base.filter((item) => item.name.toLowerCase().includes(busqueda.toLowerCase()))
    : base

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
        {estados.map((unEstado) => (
          <button
            type="button"
            key={unEstado}
            className={estado === unEstado ? 'activo' : ''}
            onClick={() => setEstado(unEstado)}
          >
            {ETIQUETAS[unEstado] ?? unEstado}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder={
          verTitanes ? 'Buscar titán' : 'Buscar personaje'
        }
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="c-buscador"
      />

      {resultados.length === 0 && (
        <p>{verTitanes ? 'No se encontraron titanes.' : 'No se encontraron personajes.'}</p>
      )}

      <div className="c-lista">
        {resultados.map((item) => (
          <div
            className={`c-lista-personaje${item.esTitan ? ' es-titan' : ''}`}
            key={`${item.esTitan ? 't' : 'p'}${item.id}`}
            onClick={() =>
              item.esTitan ? setTitanElegido(item) : navigate(`/personaje/${item.id}`)
            }
          >
            <p>{item.id}</p>
            <p>{item.name}</p>
            <Foto src={item.image} alt={item.name} />
          </div>
        ))}
      </div>

      {titanElegido && (
        <DetalleTitan titan={titanElegido} onCerrar={() => setTitanElegido(null)} />
      )}
    </>
  )
}

export default Inicio