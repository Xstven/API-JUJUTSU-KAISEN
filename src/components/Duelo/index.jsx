import { useEffect, useState } from 'react'
import { getPersonajes } from '../../api'
import './style.css'

// De menor a mayor nivel
const ORDEN = [
  'sin grado', 'grade 4', 'grade 3', 'grade 2', 'semi-grade 1',
  'grade 1', 'semi-special grade', 'special grade',
]

const MAX_VISIBLES = 60

const nivel = (p) => {
  const i = ORDEN.indexOf(p.gradeName.toLowerCase())
  return i === -1 ? 0 : i
}

// Fórmula propia del duelo
const poder = (p) =>
  nivel(p) * 12 + p.cursedTechniques.length * 3 + (p.domainExpansion ? 6 : 0)

// Selector con buscador: abre la lista completa y filtra al escribir
function Selector({ lista, valor, onElegir, placeholder, clase }) {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')

  const elegido = lista.find((p) => p.id === valor)
  const q = texto.trim().toLowerCase()
  const filtrados = q ? lista.filter((p) => p.name.toLowerCase().includes(q)) : lista
  const visibles = filtrados.slice(0, MAX_VISIBLES)

  const abrir = () => {
    setTexto('')
    setAbierto(true)
  }

  const elegir = (p) => {
    onElegir(p.id)
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
          {visibles.map((p) => (
            <li
              key={p.id}
              className={p.id === valor ? 'activo' : ''}
              onClick={() => elegir(p)}
            >
              {p.image ? <img src={p.image} alt="" loading="lazy" /> : <i />}
              <span>{p.name}</span>
              <small>{p.gradeName}</small>
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

function Luchador({ p, lado, estado }) {
  return (
    <div className={`duelo-luchador ${lado} ${estado}`}>
      {p.image ? <img src={p.image} alt={p.name} /> : <div className="duelo-sinfoto">?</div>}
      <h3>{p.name}</h3>
      <span>{p.gradeName}</span>
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
  const [idA, setIdA] = useState(null)
  const [idB, setIdB] = useState(null)
  const [pelea, setPelea] = useState(false)

  useEffect(() => {
    getPersonajes()
      .then(setLista)
      .catch((error) => console.error('Error:', error))
  }, [])

  const ordenados = [...lista].sort((x, y) => x.name.localeCompare(y.name))
  const a = lista.find((p) => p.id === idA)
  const b = lista.find((p) => p.id === idB)
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

  if (lista.length === 0) return <p className="c-estado">Cargando...</p>

  return (
    <div className="c-page duelo">
      <h1>Duelo</h1>

      <div className="duelo-selects">
        <Selector
          lista={ordenados}
          valor={idA}
          onElegir={elegirA}
          placeholder="Personaje 1"
          clase="sel-a"
        />
        <span className="duelo-vs">VS</span>
        <Selector
          lista={ordenados}
          valor={idB}
          onElegir={elegirB}
          placeholder="Personaje 2"
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

      {mismo && <p className="duelo-aviso">Elige dos personajes distintos.</p>}

      {listos && (
        <section className="duelo-arena" key={`${a.id}-${b.id}-${pelea}`}>
          <Luchador p={a} lado="izq" estado={estadoA} />
          <div className="duelo-centro">VS</div>
          <Luchador p={b} lado="der" estado={estadoB} />
        </section>
      )}

      {listos && pelea && (
        <section className="duelo-resultado">
          <Fila etiqueta="Grado" a={nivel(a)} b={nivel(b)} ta={a.gradeName} tb={b.gradeName} />
          <Fila etiqueta="Técnicas" a={a.cursedTechniques.length} b={b.cursedTechniques.length} />
          <Fila
            etiqueta="Dominio"
            a={a.domainExpansion ? 1 : 0}
            b={b.domainExpansion ? 1 : 0}
            ta={a.domainExpansion ? 'Sí' : 'No'}
            tb={b.domainExpansion ? 'Sí' : 'No'}
          />
          <Fila etiqueta="Poder" a={pa} b={pb} />

          <div className="duelo-barra">
            <div className="duelo-barra-a" style={{ width: `${(pa / (pa + pb || 1)) * 100}%` }} />
            <div className="duelo-barra-b" />
          </div>

          <p className="duelo-veredicto">
            {ganador ? `¡Gana ${ganador.name}!` : '¡Empate!'}
          </p>
          <p className="duelo-formula">
            Poder = nivel de grado × 12 + técnicas × 3 + 6 si tiene expansión de dominio
          </p>
        </section>
      )}
    </div>
  )
}

export default Duelo