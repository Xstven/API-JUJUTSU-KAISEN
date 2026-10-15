import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPersonajes } from '../../api';
import { colorDe } from '../../temas';
import './style.css';

function Coleccion() {
  const [personajes, setPersonajes] = useState([]);
  const [listaCapturados, setListaCapturados] = useState(() => {
    try {
      const guardados = JSON.parse(localStorage.getItem('misPersonajes') || '[]');
      return Array.isArray(guardados) ? [...new Set(guardados.map(Number))] : [];
    } catch {
      return [];
    }
  });
  const [nuevos, setNuevos] = useState([]);
  const navigate = useNavigate();
  const total = personajes.length;

  useEffect(() => {
    getPersonajes()
      .then(setPersonajes)
      .catch((error) => console.error('Error al cargar personajes:', error));
  }, []);

  const capturarAleatorios = () => {
    const seleccionados = Array.from(
      { length: 4 },
      () => personajes[Math.floor(Math.random() * total)]
    );
    const vistos = new Set(listaCapturados);
    const resultados = seleccionados.map((p) => {
      const repetido = vistos.has(p.id);
      vistos.add(p.id);
      return { ...p, repetido };
    });
    const actualizados = [...vistos];

    setListaCapturados(actualizados);
    setNuevos(resultados);
    localStorage.setItem('misPersonajes', JSON.stringify(actualizados));
  };

  return (
    <main className="coleccion">
      <h1 className="coleccion-titulo">Colección</h1>
      <p className="coleccion-contador">{listaCapturados.length} <span>/ {total}</span></p>
      <button
        className="coleccion-boton"
        onClick={capturarAleatorios}
        disabled={total === 0 || listaCapturados.length >= total}
      >
        4 nuevos
      </button>

      {nuevos.length > 0 && <h2 className="coleccion-subtitulo">Tus nuevos personajes</h2>}
      <section className="coleccion-nuevos">
        {nuevos.map((p, indice) => (
          <div
            key={`${p.id}-${indice}`}
            className={p.repetido ? 'coleccion-nuevo repetido' : 'coleccion-nuevo'}
            style={{ '--acento': colorDe(p) }}
            onClick={() => navigate(`/personaje/${p.id}`)}
          >
            <p>{p.id}</p>
            {p.image && <img src={p.image} alt={p.name} width="60" height="60" />}
            <p>{p.name}</p>
          </div>
        ))}
      </section>

      <section className="coleccion-album">
        {personajes.map((p) => {
          const capturado = listaCapturados.includes(p.id);
          return (
            <div
              key={p.id}
              className={capturado ? 'coleccion-personaje capturado' : 'coleccion-personaje'}
              style={{ '--acento': colorDe(p) }}
              onClick={() => capturado && navigate(`/personaje/${p.id}`)}
            >
              {capturado && p.image && (
                <img src={p.image} height="45" loading="lazy" alt={p.name} />
              )}
              <p>{p.id}</p>
            </div>
          );
        })}
      </section>
    </main>
  );
}

export default Coleccion;