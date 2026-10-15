
const PUENTE = 'Android'

export async function compartir(texto) {
  if (window[PUENTE]?.share) {
    window[PUENTE].share(texto)
    return
  }
  if (navigator.share) {
    try {
      await navigator.share({ text: texto })
    } catch {
    }
    return
  }
  try {
    await navigator.clipboard.writeText(texto)
    alert('Copiado al portapapeles')
  } catch {
  }
}