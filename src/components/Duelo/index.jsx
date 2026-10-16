import { useEffect, useState } from 'react'
import { getTitanes } from '../../api'
import './style.css'

const MAX_VISIBLES = 60

// Estadísticas del 1 al 10 definidas a mano según lo que muestra la serie.
// Es una valoración propia: no viene de la API.
const ESTADISTICAS = [
  { patron: /founding/i,     fuerza: 10, defensa: 9,  velocidad: 6,  habilidad: 10 },
  { patron: /war\s*hammer/i, fuerza: 8,  defensa: 8,  velocidad: 5,  habilidad: 9 },
  { patron: /attack/i,       fuerza: 7,  defensa: 6,  velocidad: 8,  habilidad: 9 },
  { patron: /colossal/i,     fuerza: 9,  defensa: 7,  velocidad: 2,  habilidad: 9 },
  { patron: /armored/i,      fuerza: 8,  defensa: 10, velocidad: 5,  habilidad: 7 },
  { patron: /beast/i,        fuerza: 8,  defensa: 6,  velocidad: 6,  habilidad: 8 },
  { patron: /female/i,       fuerza: 7,  defensa: 7,  velocidad: 9,  habilidad: 8 },
  { patron: /jaw/i,          fuerza: 6,  defensa: 5,  velocidad: 10, habilidad: 6 },
  { patron: /cart/i,         fuerza: 4,  defensa: 4,  velocidad: 7,  habilidad: 6 },
]

const SIN_DATOS = { fuerza: 5, defensa: 5, velocidad: 5, habilidad: 5 }

const stats = (t) => ESTADISTICAS.find((e) => e.patron.test(t.name)) ?? SIN_DATOS

const poder = (t) => {
  const s = stats(t)
  return s.fuerza + s.defensa + s.velocidad + s.habilidad
}

// Selector con buscador: abre la lista completa y filtra al escribir
function Selector({ lista, valor, onElegir, placeholder, clase }) {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')

  const elegido = lista.find((t) => t.id === valor)
  const q = texto.trim().toLowerCase()
  const filtrados = q ? lista.filter((t) => t.name.toLowerCase().includes(q)) : lista
  const visibles = filtrados.slice(0, MAX_VISIBLES)

  const abrir = () => {
    setTexto('')
    setAbierto(true)
  }

  const elegir = (t) => {
    onElegir(t.id)
    setAbierto(false)
    setTexto('')
  }

  const teclas = (e) => {
    if (e.key === 'Enter' && visibles[0]) {
      e.preventDefault()
      elegir(visibles[0])
      e.target.blur()
    }
    if (e.key === 'Escape') {
      setAbierto(false)
      e.target.blur()
    }
  }

  return (
    <div className={`duelo-selector ${clase}`}>
      <input
        type="text"
        className="duelo-input"
        placeholder={abierto && elegido ? elegido.name : placeholder}
        value={abierto ? texto : elegido?.name ?? ''}
        onFocus={abrir}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={() => setAbierto(false)}
        onKeyDown={teclas}
        aria-label={placeholder}
        autoComplete="off"
      />

      {abierto && (
        <ul className="duelo-lista" onMouseDown={(e) => e.preventDefault()}>
          {visibles.map((t) => (
            <li
              key={t.id}
              className={t.id === valor ? 'activo' : ''}
              onClick={() => elegir(t)}
            >
              {t.image ? <img src={t.image} alt="" loading="lazy" /> : <i />}
              <span>{t.name}</span>
              <small>{t.height ?? t.allegiance ?? ''}</small>
            </li>
          ))}
          {visibles.length === 0 && <li className="duelo-vacio">Sin resultados</li>}
          {filtrados.length > MAX_VISIBLES && (
            <li className="duelo-mas">
              Hay {filtrados.length - MAX_VISIBLES} más, escribe para buscar
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

function Luchador({ t, lado, estado }) {
  return (
    <div className={`duelo-luchador ${lado} ${estado}`}>
      {t.image ? <img src={t.image} alt={t.name} /> : <div className="duelo-sinfoto">?</div>}
      <h3>{t.name}</h3>
      <span>{t.herederoActual ? `Portador: ${t.herederoActual.name}` : 'Sin portador'}</span>
    </div>
  )
}

function Fila({ etiqueta, a, b, ta = a, tb = b }) {
  return (
    <div className="duelo-fila">
      <span className={a > b ? 'mejor' : ''}>{ta}</span>
      <em>{etiqueta}</em>
      <span className={b > a ? 'mejor' : ''}>{tb}</span>
    </div>
  )
}

function Duelo() {
  const [lista, setLista] = useState([])
  const [error, setError] = useState(null)
  const [idA, setIdA] = useState(null)
  const [idB, setIdB] = useState(null)
  const [pelea, setPelea] = useState(false)

  useEffect(() => {
    getTitanes()
      .then((titanes) => {
        titanes.forEach((t) => {
          if (stats(t) === SIN_DATOS) console.warn('Titán sin estadísticas:', t.name)
        })
        setLista(titanes)
      })
      .catch((e) => {
        console.error('Error:', e)
        setError('No se pudieron cargar los titanes')
      })
  }, [])

  const ordenados = [...lista].sort((x, y) => x.name.localeCompare(y.name))
  const a = lista.find((t) => t.id === idA)
  const b = lista.find((t) => t.id === idB)
  const mismo = a && b && a.id === b.id
  const listos = a && b && !mismo

  const elegirA = (id) => { setIdA(id); setPelea(false) }
  const elegirB = (id) => { setIdB(id); setPelea(false) }

  const aleatorio = () => {
    if (lista.length < 2) return
    const x = lista[Math.floor(Math.random() * lista.length)]
    let y = x
    while (y.id === x.id) y = lista[Math.floor(Math.random() * lista.length)]
    setIdA(x.id)
    setIdB(y.id)
    setPelea(true)
  }

  const pa = listos ? poder(a) : 0
  const pb = listos ? poder(b) : 0
  const ganador = pa === pb ? null : pa > pb ? a : b
  const estadoA = !pelea ? '' : ganador === null ? 'empate' : ganador === a ? 'gana' : 'pierde'
  const estadoB = !pelea ? '' : ganador === null ? 'empate' : ganador === b ? 'gana' : 'pierde'

  if (error) return <p className="c-estado">{error}</p>
  if (lista.length === 0) return <p className="c-estado">Cargando...</p>

  return (
    <div className="c-page duelo">
      <h1>Duelo de Titanes</h1>

      <div className="duelo-selects">
        <Selector
          lista={ordenados}
          valor={idA}
          onElegir={elegirA}
          placeholder="Titán 1"
          clase="sel-a"
        />
        <span className="duelo-vs">VS</span>
        <Selector
          lista={ordenados}
          valor={idB}
          onElegir={elegirB}
          placeholder="Titán 2"
          clase="sel-b"
        />
      </div>

      <div className="duelo-botones">
        <button className="duelo-pelear" onClick={() => setPelea(true)} disabled={!listos}>
          ¡Pelear!
        </button>
        <button className="duelo-aleatorio" onClick={aleatorio}>
          Aleatorio
        </button>
      </div>

      {mismo && <p className="duelo-aviso">Elige dos titanes distintos.</p>}

      {listos && (
        <section className="duelo-arena" key={`${a.id}-${b.id}-${pelea}`}>
          <Luchador t={a} lado="izq" estado={estadoA} />
          <div className="duelo-centro">VS</div>
          <Luchador t={b} lado="der" estado={estadoB} />
        </section>
      )}

      {listos && pelea && (
        <section className="duelo-resultado">
          <Fila etiqueta="Fuerza" a={stats(a).fuerza} b={stats(b).fuerza} />
          <Fila etiqueta="Defensa" a={stats(a).defensa} b={stats(b).defensa} />
          <Fila etiqueta="Velocidad" a={stats(a).velocidad} b={stats(b).velocidad} />
          <Fila etiqueta="Habilidad" a={stats(a).habilidad} b={stats(b).habilidad} />
          <Fila etiqueta="Poder" a={pa} b={pb} />

          <div className="duelo-barra">
            <div className="duelo-barra-a" style={{ width: `${(pa / (pa + pb || 1)) * 100}%` }} />
            <div className="duelo-barra-b" />
          </div>

          <p className="duelo-veredicto">
            {ganador ? `¡Gana ${ganador.name}!` : '¡Empate!'}
          </p>
          <p className="duelo-formula">
            Poder = fuerza + defensa + velocidad + habilidad (cada una de 1 a 10, valoradas según la serie)
          </p>
        </section>
      )}
    </div>
  )
}

export default Duelo