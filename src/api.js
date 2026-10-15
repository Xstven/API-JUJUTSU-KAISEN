const BASE = 'https://data.jujutsukaisenapi.site/api/v1/characters'
const CLAVE = 'jjkPersonajes_v1'

const pedirPagina = (n) => fetch(`${BASE}?page=${n}`).then((r) => r.json())

let cache = null

export function getPersonajes() {
  if (cache) return cache
  cache = cargar().catch((error) => {
    cache = null
    throw error
  })
  return cache
}

export async function getPersonaje(id) {
  const lista = await getPersonajes()
  return lista.find((p) => p.id === Number(id))
}

async function cargar() {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE) || 'null')
    if (Array.isArray(guardado) && guardado.length) return guardado
  } catch {
  }

  const primera = await pedirPagina(1)
  const meta = primera.meta ?? primera
  const ultima = meta.last_page ?? Math.ceil((meta.total ?? 0) / (meta.per_page ?? 20))

  const resto = await Promise.all(
    Array.from({ length: Math.max(ultima - 1, 0) }, (_, i) => pedirPagina(i + 2))
  )

  const lista = [primera, ...resto]
    .flatMap((r) => r.data ?? [])
    .map(normalizar)
    .sort((a, b) => a.id - b.id)

  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(lista))
  } catch {
  }
  return lista
}

function normalizar(p) {
  return {
    id: p.id,
    image: p.image ?? p.domainExpansion?.image ?? null,
    name: p.name,
    gradeName: p.grade?.name ?? 'Sin grado',
    species: p.species ? { species_name: p.species.species_name } : null,
    age: p.age,
    height: p.height,
    birthday: p.birthday,
    occupations: (p.occupations ?? []).map((o) => ({ occupation_name: o.occupation_name })),
    cursedTechniques: (p.cursedTechniques ?? []).map((t) => ({ technique_name: t.technique_name })),
    domainExpansion: p.domainExpansion ? { name: p.domainExpansion.name } : null,
  }
}