import { useState } from 'react'

const contar = (clave) => {
  try {
    const datos = JSON.parse(localStorage.getItem(clave) || '[]')
    return Array.isArray(datos) ? datos.length : 0
  } catch {
    return 0
  }
}

function Usuario() {
  const [capturados, setCapturados] = useState(() => contar('misPersonajes'))
  const [favoritos, setFavoritos] = useState(() => contar('favoritos'))

  const borrarTodo = () => {
    if (!window.confirm('¿Borrar colección y favoritos?')) return
    localStorage.removeItem('misPersonajes')
    localStorage.removeItem('favoritos')
    setCapturados(0)
    setFavoritos(0)
  }

  return (
    <main className="c-page">
      <h1>Usuario</h1>

      <div className="c-grid">
        <div className="c-card">
          <h3>{capturados}</h3>
          <p>Capturados</p>
        </div>
        <div className="c-card">
          <h3>{favoritos}</h3>
          <p>Favoritos</p>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: 30 }}>
        <button onClick={borrarTodo}>Reiniciar progreso</button>
      </p>
    </main>
  )
}

export default Usuario