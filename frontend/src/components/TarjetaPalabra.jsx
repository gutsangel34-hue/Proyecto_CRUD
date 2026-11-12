import BotonAudio from './BotonAudio'

// Tarjeta reutilizable de una palabra: la usan Lección y Diccionario.
function TarjetaPalabra({ palabra, dominada = false, onDominar }) {
  return (
    <div className={`card word-card ${dominada ? 'is-dominada' : ''}`}>
      <div className="word-card__cabecera">
        <span className="word-card__nativa">{palabra.palabra_lengua_nativa}</span>
        <BotonAudio url={palabra.audio_url} palabra={palabra.palabra_lengua_nativa} />
      </div>
      <span className="word-card__traduccion">{palabra.traduccion_espanol}</span>
      <div className="word-card__footer">
        <span className="badge">{palabra.categorias?.nombre || palabra.dificultad}</span>
        {onDominar && (
          dominada
            ? <span className="badge badge--ok">Dominada ✓</span>
            : <button className="btn-dominar" onClick={() => onDominar(palabra.id_palabra)}>Dominado ✓</button>
        )}
      </div>
    </div>
  )
}

export default TarjetaPalabra
