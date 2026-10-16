const BASE = 'https://api.attackontitanapi.com/characters'
const CLAVE = 'aotPersonajes_v1'
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
    if (p?.id) return normalizar(p)
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
    const ultima = primera.info?.pages ?? 1

    const paginas = [primera]
    const restantes = Array.from({ length: Math.max(ultima - 1, 0) }, (_, i) => i + 2)

    for (let i = 0; i < restantes.length; i += SIMULTANEAS) {
      const lote = restantes.slice(i, i + SIMULTANEAS)
      paginas.push(...(await Promise.all(lote.map(pedirPagina))))
    }

    const lista = paginas
      .flatMap((r) => r.results ?? [])
      .map(normalizar)
      .sort((a, b) => a.id - b.id)

    if (!lista.length) throw new Error('La API no devolvió personajes')

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

// La API a veces manda un texto, a veces una lista; esto lo deja siempre como lista
function aLista(valor) {
  if (valor == null || valor === '') return []
  return Array.isArray(valor) ? valor : [valor]
}

function normalizar(p) {
  const especies = aLista(p.species)
  const ocupaciones = aLista(p.occupation)
  return {
    id: p.id,
    image: p.img ?? null,
    name: p.name ?? 'Sin nombre',
    // gradeName ahora trae el estado (Alive, Deceased, Unknown), sirve para el filtro
    gradeName: p.status ?? 'Unknown',
    species: especies.length ? { species_name: especies.join(', ') } : null,
    age: p.age ?? null,
    height: p.height ?? null,
    birthday: null,
    occupations: ocupaciones.map((o) => ({ occupation_name: String(o) })),
    alias: aLista(p.alias),
    status: p.status ?? null,
    relatives: p.relatives ?? [],

    // Campos nuevos de Attack on Titan
    gender: p.gender ?? null,
    residence: p.residence ?? null,
    birthplace: p.birthplace ?? null,
    roles: aLista(p.roles),
    groups: p.groups ?? [],

    // Campos de JJK que esta API no tiene (vacíos para que los componentes no se rompan)
    cursedTechniques: [],
    domainExpansion: null,
  }
}

// ---------- Titanes (para el Duelo) ----------
const URL_TITANES = 'https://api.attackontitanapi.com/titans'

let cacheTitanes = null

export function getTitanes() {
  if (cacheTitanes) return cacheTitanes
  cacheTitanes = cargarTitanes().catch((error) => {
    cacheTitanes = null
    throw error
  })
  return cacheTitanes
}

const idDeUrl = (url) => {
  const m = String(url ?? '').match(/(\d+)\/?$/)
  return m ? Number(m[1]) : null
}

async function cargarTitanes() {
  const res = await pedir(URL_TITANES)
  const crudos = res.results ?? []
  if (!crudos.length) throw new Error('La API no devolvió titanes')

  // Los portadores vienen como links a /characters/ID; se les pone nombre y foto
  // con la lista de personajes. Si esa lista falla, el titán igual carga.
  let personajes = []
  try {
    personajes = await getPersonajes()
  } catch {
  }
  const porId = new Map(personajes.map((p) => [p.id, p]))
  const persona = (url) => {
    const id = idDeUrl(url)
    if (id == null) return null
    const p = porId.get(id)
    return { id, name: p?.name ?? `Personaje ${id}`, image: p?.image ?? null }
  }

  return crudos.map((t) => {
    const altura = parseFloat(String(t.height ?? '').replace(/,/g, ''))
    return {
      id: t.id,
      name: t.name ?? 'Titán',
      image: t.img ?? null,
      height: t.height ?? null,
      alturaMetros: Number.isFinite(altura) ? altura : null,
      abilities: aLista(t.abilities),
      allegiance: t.allegiance ?? null,
      herederoActual: persona(t.current_inheritor),
      herederosAnteriores: aLista(t.former_inheritors).map((u) => persona(u)).filter(Boolean),
    }
  })
}