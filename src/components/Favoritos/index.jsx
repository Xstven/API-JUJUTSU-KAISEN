import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPersonajes } from '../../api';
import { colorDe } from '../../temas';
import './style.css'

function Favoritos() {
  const navigate = useNavigate();
  const [personajes, setPersonajes] = useState([]);
  const [favoritos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favoritos') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    getPersonajes()
      .then(setPersonajes)
      .catch((error) => console.error('Error:', error));
  }, []);

  return (
    <>
      <h1 className="c-titulo-pagina">Favoritos</h1>

      {favoritos.length === 0 && (
        <p className="c-estado">Aún no tienes favoritos.</p>
      )}

      <div className="c-lista">
        {favoritos.map((fav) => {
          const personaje = personajes.find((p) => p.id === fav.id);
          return (
            <div
              key={fav.id}
              className="c-lista-personaje"
              style={{ '--acento': colorDe(personaje) }}
              onClick={() => navigate(`/personaje/${fav.id}`)}
            >
              <p>{fav.id}</p>
              <p>{fav.nombre}</p>
              {personaje?.image && (
                <img
                  src={personaje.image}
                  alt={fav.nombre}
                  height="60"
                  loading="lazy"
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  )
}

export default Favoritos