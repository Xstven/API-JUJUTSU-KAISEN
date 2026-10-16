const POR_ESTADO = {
  alive: '#22c55e',
  deceased: '#64748b',
  unknown: '#f59e0b',
}

const POR_NOMBRE = [
  ['eren', '#14b8a6'],
  ['mikasa', '#ef4444'],
  ['armin', '#38bdf8'],
  ['levi', '#cbd5e1'],
  ['erwin', '#eab308'],
  ['hange', '#a855f7'],
  ['reiner', '#b45309'],
  ['annie', '#f0abfc'],
]

export const colorDe = (p) => {
  if (!p) return '#5f7a45'
  const nombre = (p.name || '').toLowerCase()
  const propio = POR_NOMBRE.find(([clave]) => nombre.includes(clave))
  if (propio) return propio[1]
  return POR_ESTADO[(p.gradeName || '').toLowerCase()] || '#5f7a45'
}