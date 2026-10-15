import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react'
import { getPersonaje } from '../../api'
import './style.css'

function Personajes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState(null);
    const [favoritos, setFavoritos] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('favoritos') || '[]');
        } catch {
            return [];
        }
    });
    const esFavorito = favoritos.some(p => p.id === data?.id);

    // Si entró directo por link no hay historial, entonces va a Inicio
    const volver = () => (location.key !== 'default' ? navigate(-1) : navigate('/'));

    useEffect(() => {
        getPersonaje(id)
            .then(setData)
            .catch(error => console.error("Error:", error));
    }, [id]);

    const toggleFavorito = () => {
        let nuevosFavoritos;
        if (esFavorito) {
            nuevosFavoritos = favoritos.filter(p => p.id !== data.id);
        } else {
            nuevosFavoritos = [...favoritos, { id: data.id, nombre: data.name }];
        }
        setFavoritos(nuevosFavoritos);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    };

    if (!data) return <p>Cargando...</p>;

    const ocupaciones = data.occupations?.map(o => o.occupation_name).join(', ');
    const tecnicas = data.cursedTechniques?.map(t => t.technique_name).join(', ');

    return (
        <div className="c-personaje">
            <button className="c-volver" onClick={volver} aria-label="Volver">←</button>

            <h1>{data.name}</h1>
            {data.image && (
                <img
                    src={data.image}
                    alt={data.name}
                    width="200"
                />
            )}

            <p>{data.id}</p>
            <p>{data.gradeName} · {data.species?.species_name ?? 'Desconocido'}</p>

            <p>Edad: {data.age ?? '?'} / Altura: {data.height ?? '?'}</p>
            <p>Cumpleaños: {data.birthday ?? '?'}</p>
            <p>Ocupación: {ocupaciones || 'Ninguna'}</p>
            <p>Técnicas: {tecnicas || 'Ninguna'}</p>
            <p>Expansión de dominio: {data.domainExpansion?.name ?? 'No tiene'}</p>

            <button className="c-fav" onClick={toggleFavorito}>
                {esFavorito ? '❤️' : '🤍'}
            </button>
        </div>
    )
}

export default Personajes