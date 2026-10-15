import { useEffect, useState } from 'react'
import { getPersonajes } from '../../api'
import portada from '../../assets/api.jpg'
import './style.css'

const GRADOS = [
  'Sin grado', 'Grade 4', 'Grade 3', 'Grade 2',
  'Semi-Grade 1', 'Grade 1', 'Semi-Special Grade', 'Special Grade',
]

const SECCIONES = [
  { titulo: 'Inicio', texto: 'Lista de personajes con filtro por grado y buscador desde 3 letras.' },
  { titulo: 'Detalle', texto: 'Ficha completa: grado, técnicas, expansión de dominio, estado y alias.' },
  { titulo: 'Favoritos', texto: 'Guarda con el corazón a los personajes que más te gustan.' },
  { titulo: 'Colección', texto: 'Consigue 4 personajes al azar y completa tu álbum.' },
  { titulo: 'Duelo', texto: 'Enfrenta a dos personajes y mira quién gana según su poder.' },
]

function Info() {
  const [total, setTotal] = useState(null)

  useEffect(() => {
    getPersonajes()
      .then((lista) => setTotal(lista.length))
      .catch(() => setTotal(null))
  }, [])

  return (
    <div className="c-page info">
      <h1 className="info-oculto">Info</h1>

      <header className="info-hero">
        <img
          className="info-portada"
          src={portada}
          alt="Cursed Energy API, información de personajes de Jujutsu Kaisen"
        />
      </header>

      <section className="info-stats">
        <div className="info-stat">
          <strong>{total ?? '...'}</strong>
          <span>Personajes</span>
        </div>
        <div className="info-stat">
          <strong>{GRADOS.length}</strong>
          <span>Grados</span>
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

      <h2 className="info-titulo">Escala de grados</h2>
      <ol className="info-escala">
        {GRADOS.map((g, i) => (
          <li
            key={g}
            style={{ '--i': i, '--p': `${Math.round((i / (GRADOS.length - 1)) * 100)}%` }}
          >
            <span>{g}</span>
            <b>{i + 1}</b>
          </li>
        ))}
      </ol>

      <h2 className="info-titulo">Créditos</h2>
      <section className="info-creditos">
        <div>
          <span>API</span>
          <p>Cursed Energy API · jujutsukaisenapi.site</p>
        </div>
        <div>
          <span>Autor de la API</span>
          <p>Brayan Steven Largo Ramirez · github.com/Xstven</p>
        </div>
        <div>
          <span>Serie</span>
          <p>Jujutsu Kaisen, obra de Gege Akutami. Esta app es un proyecto académico y no tiene relación oficial con la serie.</p>
        </div>
      </section>
    </div>
  )
}

export default Info