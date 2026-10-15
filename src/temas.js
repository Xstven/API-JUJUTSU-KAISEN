const POR_GRADO = {
  'sin grado': '#94a3b8',
  'grade 4': '#22c55e',
  'grade 3': '#06b6d4',
  'grade 2': '#3b82f6',
  'semi-grade 1': '#8b5cf6',
  'grade 1': '#d946ef',
  'semi-special grade': '#f97316',
  'special grade': '#facc15',
}

// Solo los personajes principales tienen color propio
const POR_NOMBRE = [
  ['gojo', '#38bdf8'],
  ['sukuna', '#ef4444'],
  ['megumi', '#14b8a6'],
  ['itadori', '#fb7185'],
  ['nobara', '#fb923c'],
]

export const colorDe = (p) => {
  if (!p) return '#7c3aed'
  const nombre = (p.name || '').toLowerCase()
  const propio = POR_NOMBRE.find(([clave]) => nombre.includes(clave))
  if (propio) return propio[1]
  return POR_GRADO[(p.gradeName || '').toLowerCase()] || '#7c3aed'
}