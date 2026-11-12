import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLeccionDetalle, registrarPractica } from '../api'
import { useAuth } from '../AuthContext'

const PREGUNTAS_POR_RONDA = 8

function mezclar(lista) {
  return [...lista].sort(() => Math.random() - 0.5)
}

// Arma las preguntas: una palabra kankuama y cuatro traducciones posibles.
function crearPreguntas(palabras) {
  return mezclar(palabras)
    .slice(0, PREGUNTAS_POR_RONDA)
    .map((palabra) => {
      const distractores = mezclar(
        palabras.filter((p) => p.traduccion_espanol !== palabra.traduccion_espanol)
      ).slice(0, 3)
      return { palabra, opciones: mezclar([palabra, ...distractores]) }
    })
}

// Ejercicio de práctica de opción múltiple (HU-05)
function Quiz() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const [titulo, setTitulo] = useState('')
  const [palabras, setPalabras] = useState([])
  const [preguntas, setPreguntas] = useState([])
  const [actual, setActual] = useState(0)
  const [elegida, setElegida] = useState(null)
  const [aciertos, setAciertos] = useState(0)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const detalle = await getLeccionDetalle(id)
      setTitulo(detalle.titulo)
      setPalabras(detalle.palabras)
      setPreguntas(crearPreguntas(detalle.palabras))
      setCargando(false)
    }
    cargar()
  }, [id])

  function responder(opcion) {
    if (elegida) return
    const pregunta = preguntas[actual]
    const correcta = opcion.id_palabra === pregunta.palabra.id_palabra
    setElegida(opcion)
    if (correcta) setAciertos((n) => n + 1)
    registrarPractica(usuario.id_usuario, pregunta.palabra.id_palabra, correcta)
  }

  function siguiente() {
    setElegida(null)
    setActual((n) => n + 1)
  }

  function reiniciar() {
    setPreguntas(crearPreguntas(palabras))
    setActual(0)
    setAciertos(0)
    setElegida(null)
  }

  if (cargando) return <div className="page"><p className="empty-state">Preparando la práctica...</p></div>

  if (palabras.length < 4) {
    return (
      <div className="page">
        <p className="empty-state">Esta lección necesita al menos 4 palabras para practicar.</p>
      </div>
    )
  }

  const terminado = actual >= preguntas.length

  if (terminado) {
    return (
      <div className="page page--estrecha">
        <div className="quiz card">
          <h1>¡Práctica terminada!</h1>
          <p className="quiz__puntaje">{aciertos} de {preguntas.length}</p>
          <p className="quiz__texto">
            {aciertos === preguntas.length ? 'Respondiste todo bien.' : 'Sigue practicando para dominarlas todas.'}
          </p>
          <div className="quiz__acciones">
            <button onClick={reiniciar}>Practicar otra vez</button>
            <Link className="btn btn-ghost" to={`/lecciones/${id}`}>Volver a la lección</Link>
          </div>
        </div>
      </div>
    )
  }

  const pregunta = preguntas[actual]
  const acerto = elegida?.id_palabra === pregunta.palabra.id_palabra

  return (
    <div className="page page--estrecha">
      <Link to={`/lecciones/${id}`}>&larr; Volver a {titulo}</Link>

      <div className="quiz card">
        <div className="quiz__avance">
          <span>Pregunta {actual + 1} de {preguntas.length}</span>
          <span>Aciertos: {aciertos}</span>
        </div>
        <progress className="quiz__barra" value={actual} max={preguntas.length} />

        <p className="quiz__texto">¿Qué significa en español?</p>
        <p className="quiz__palabra">{pregunta.palabra.palabra_lengua_nativa}</p>

        <div className="quiz__opciones">
          {pregunta.opciones.map((opcion) => {
            const esCorrecta = opcion.id_palabra === pregunta.palabra.id_palabra
            let estado = ''
            if (elegida && esCorrecta) estado = 'is-correcta'
            else if (elegida?.id_palabra === opcion.id_palabra) estado = 'is-incorrecta'
            return (
              <button
                key={opcion.id_palabra}
                className={`quiz__opcion ${estado}`}
                onClick={() => responder(opcion)}
                disabled={Boolean(elegida)}
              >
                {opcion.traduccion_espanol}
              </button>
            )
          })}
        </div>

        {elegida && (
          <div className={`quiz__resultado ${acerto ? 'is-correcta' : 'is-incorrecta'}`} role="status">
            <span>
              {acerto ? '¡Correcto!' : `Incorrecto. Significa: ${pregunta.palabra.traduccion_espanol}`}
            </span>
            <button onClick={siguiente}>
              {actual + 1 === preguntas.length ? 'Ver resultado' : 'Siguiente'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Quiz
