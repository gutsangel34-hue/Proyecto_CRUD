// Reproduce la pronunciación de una palabra (HU-02).
// Si la palabra todavía no tiene grabación, el botón queda desactivado.
function BotonAudio({ url, palabra }) {
  function reproducir() {
    new Audio(url).play().catch(() => alert('No se pudo reproducir el audio'))
  }

  if (!url) {
    return (
      <button className="btn-audio" disabled title="Audio pendiente de grabar" aria-label={`Audio de ${palabra} pendiente`}>
        🔇
      </button>
    )
  }

  return (
    <button className="btn-audio" onClick={reproducir} title="Escuchar pronunciación" aria-label={`Escuchar ${palabra}`}>
      🔊
    </button>
  )
}

export default BotonAudio
