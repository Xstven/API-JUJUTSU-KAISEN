const BASE = 'https://data.jujutsukaisenapi.site/api/v1/characters'
const CLAVE = 'jjkPersonajes_v2'
const VIGENCIA = 7 * 24 * 60 * 60 * 1000 // 7 días
const SIMULTANEAS = 3
const REINTENTOS = 3

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms))

async function pedir(url) {
  for (let intento = 0; intento <= REINTENTOS; intento++) {
    const control = new AbortController()
    const corte = setTimeout(() => control.abort(), 15000)
    try {
      const res = await fetch(url, { signal: control.signal })
      if (res.ok) return await res.json()
    } catch {
    } finally {
      clearTimeout(corte)
    }
    await esperar(800 * (intento + 1))
  }
  throw new Error('No se pudo cargar la API')
}

const pedirPagina = (n) => pedir(`${BASE}?page=${n}`)

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
  try {
    const res = await pedir(`${BASE}/${id}`)
    const p = res.data ?? res
    if (p?.id) return normalizarDetalle(p)
  } catch {
  }
  const lista = await getPersonajes()
  return lista.find((p) => p.id === Number(id))
}

function leerGuardado() {
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) || 'null')
    if (g && Array.isArray(g.lista) && g.lista.length) return g
  } catch {
  }
  return null
}

async function cargar() {
  const guardado = leerGuardado()
  if (guardado && Date.now() - guardado.fecha < VIGENCIA) return guardado.lista

  try {
    const primera = await pedirPagina(1)
    const meta = primera.meta ?? primera
    const ultima = meta.last_page ?? Math.ceil((meta.total ?? 0) / (meta.per_page ?? 20))

    const paginas = [primera]
    const restantes = Array.from({ length: Math.max(ultima - 1, 0) }, (_, i) => i + 2)

    for (let i = 0; i < restantes.length; i += SIMULTANEAS) {
      const lote = restantes.slice(i, i + SIMULTANEAS)
      paginas.push(...(await Promise.all(lote.map(pedirPagina))))
    }

    const lista = paginas
      .flatMap((r) => r.data ?? [])
      .map(normalizar)
      .sort((a, b) => a.id - b.id)

    try {
      localStorage.setItem(CLAVE, JSON.stringify({ fecha: Date.now(), lista }))
    } catch {
    }
    return lista
  } catch (error) {
    if (guardado) return guardado.lista
    throw error
  }
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

function normalizarDetalle(p) {
  return {
    ...normalizar(p),
    alias: p.alias ?? [],
    status: p.status?.name ?? null,
    relatives: p.relatives ?? [],
  }
}