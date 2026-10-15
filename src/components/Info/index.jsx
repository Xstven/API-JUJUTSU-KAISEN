function Info() {
  return (
    <main className="c-page">
      <h1>Info</h1>
      <div className="c-form" style={{ maxWidth: 600 }}>
        <h2>Sobre la app</h2>
        <p>Catálogo de personajes de Jujutsu Kaisen hecho con React y consumiendo una API.</p>
        <ul>
          <li>Busca y filtra por grado en Inicio</li>
          <li>Captura personajes en Colección</li>
          <li>Guarda tus preferidos en Favoritos</li>
        </ul>
      </div>
    </main>
  )
}

export default Info