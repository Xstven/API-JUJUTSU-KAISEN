import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react'
import { getPersonaje } from '../../api'
import { colorDe } from '../../temas'
import { compartir } from '../../compartir'
import './style.css'

const ESTADOS = { Alive: 'Vivo', Deceased: 'Fallecido', Unknown: 'Desconocido' }
const GENEROS = { Male: 'Masculino', Female: 'Femenino' }

const nombreDe = (x) => (typeof x === 'string' ? x : x?.name ?? '')

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

    const volver = () => (location.key !== 'default' ? navigate(-1) : navigate('/'));

    useEffect(() => {
        getPersonaje(id)
            .then((p) => setData(p ?? false))
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

    if (data === false) return <p className="c-estado">No se encontró el personaje.</p>;
    if (!data) return <p className="c-estado">Cargando...</p>;

    const estado = ESTADOS[data.status] ?? ESTADOS[data.gradeName] ?? data.status ?? 'Desconocido'
    const genero = GENEROS[data.gender] ?? data.gender
    const ocupaciones = data.occupations?.map(o => o.occupation_name).join(', ');
    const roles = data.roles?.map(nombreDe).filter(Boolean).join(', ');
    const grupos = data.groups?.map(nombreDe).filter(Boolean).join(', ');

    const compartirPersonaje = () =>
        compartir(
            `${data.name} · ${estado} — Attack on Titan\n${window.location.origin}/personaje/${data.id}`
        );

    return (
        <div className="c-personaje" style={{ '--acento': colorDe(data) }}>
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
            <p>{estado} · {data.species?.species_name ?? 'Desconocido'}</p>

            <p>Edad: {data.age ?? '?'} / Altura: {data.height ?? '?'}</p>
            {genero && <p>Género: {genero}</p>}
            {data.birthplace && <p>Lugar de nacimiento: {data.birthplace}</p>}
            {data.residence && <p>Residencia: {data.residence}</p>}
            {ocupaciones && <p>Ocupación: {ocupaciones}</p>}
            {roles && <p>Roles: {roles}</p>}
            {grupos && <p>Grupos: {grupos}</p>}
            {data.alias?.length > 0 && <p>Alias: {data.alias.slice(0, 3).join(', ')}</p>}

            <div className="c-acciones">
                <button className="c-fav" onClick={toggleFavorito}>
                    {esFavorito ? '❤️' : '🤍'}
                </button>
                <button className="c-compartir" onClick={compartirPersonaje}>
                    Compartir
                </button>
            </div>
        </div>
    )
}

export default Personajes