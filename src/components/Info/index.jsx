import { useEffect, useState } from 'react'
import { getPersonajes, getTitanes } from '../../api'
import portada from '../../assets/aot.jpg'
import './style.css'

const SECCIONES = [
  { titulo: 'Inicio', texto: 'Lista de personajes con filtro por estado, buscador desde 3 letras y los titanes aparte.' },
  { titulo: 'Detalle', texto: 'Ficha del personaje: estado, especie, edad, altura, roles, grupos y alias.' },
  { titulo: 'Favoritos', texto: 'Guarda con el corazón a los personajes que más te gustan.' },
  { titulo: 'Colección', texto: 'Consigue 4 personajes al azar y completa tu álbum.' },
  { titulo: 'Duelo', texto: 'Enfrenta a dos titanes y mira quién gana según sus estadísticas.' },
]

function Info() {
  const [total, setTotal] = useState(null)
  const [titanes, setTitanes] = useState([])

  useEffect(() => {
    getPersonajes()
      .then((lista) => setTotal(lista.length))
      .catch(() => setTotal(null))
    getTitanes()
      .then(setTitanes)
      .catch(() => setTitanes([]))
  }, [])

  return (
    <div className="c-page info">
      <h1 className="info-oculto">Info</h1>

      <header className="info-hero">
        <img
          className="info-portada"
          src={portada}
          alt="Attack on Titan API, información de personajes y titanes de Attack on Titan"
        />
      </header>

      <section className="info-stats">
        <div className="info-stat">
          <strong>{total ?? '...'}</strong>
          <span>Personajes</span>
        </div>
        <div className="info-stat">
          <strong>{titanes.length || '...'}</strong>
          <span>Titanes</span>
        </div>
        <div className="info-stat">
          <strong>6</strong>
          <span>Pestañas</span>
        </div>
      </section>

      <h2 className="info-titulo">¿Qué puedes hacer?</h2>
      <section className="info-grid">
        {SECCIONES.map((s, i) => (
          <article className="info-card" key={s.titulo} data-n={String(i + 1).padStart(2, '0')}>
            <h3>{s.titulo}</h3>
            <p>{s.texto}</p>
          </article>
        ))}
      </section>

      <h2 className="info-titulo">Créditos</h2>
      <section className="info-creditos">
        <div>
          <span>API</span>
          <p>Attack on Titan API · attackontitanapi.com</p>
        </div>
        <div>
          <span>Estadísticas del Duelo</span>
          <p>Son una valoración propia del autor de la app según la serie (fuerza, defensa, velocidad y habilidad).</p>
        </div>
        <div>
          <span>Serie</span>
          <p>Attack on Titan (Shingeki no Kyojin). </p>
        </div>
      </section>
    </div>
  )
}

export default Info