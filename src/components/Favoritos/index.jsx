import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPersonajes } from '../../api';
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

  if (favoritos.length === 0) return <p>Aún no tienes favoritos.</p>;

  return (
    <>
      <div className="c-lista">
        {favoritos.map((fav) => {
          const personaje = personajes.find((p) => p.id === fav.id);
          return (
            <div
              key={fav.id}
              className="c-lista-pokemon"
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