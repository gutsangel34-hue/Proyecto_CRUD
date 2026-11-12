import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLeccionDetalle, getProgreso, marcarComoDominada } from '../api'
import { useAuth } from '../AuthContext'
import TarjetaPalabra from '../components/TarjetaPalabra'

function LeccionDetalle() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const [titulo, setTitulo] = useState('')
  const [palabras, setPalabras] = useState([])
  const [dominadas, setDominadas] = useState(new Set())
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      const [detalle, progreso] = await Promise.all([
        getLeccionDetalle(id),
        getProgreso(usuario.id_usuario).catch(() => ({ palabras: [] })),
      ])
      setTitulo(detalle.titulo)
      setPalabras(detalle.palabras)
      setDominadas(new Set(progreso.palabras.filter((p) => p.dominado).map((p) => p.id_palabra)))
      setCargando(false)
    }
    cargarDatos()
  }, [id, usuario.id_usuario])

  async function dominar(idPalabra) {
    const ok = await marcarComoDominada(usuario.id_usuario, idPalabra)
    if (ok) setDominadas((anteriores) => new Set(anteriores).add(idPalabra))
  }

  if (cargando) return <div className="page"><p className="empty-state">Cargando lección...</p></div>

  return (
    <div className="page">
      <Link to="/lecciones">&larr; Volver a lecciones</Link>
      <div className="topbar">
        <h1 className="page-title">{titulo}</h1>
        {palabras.length >= 4 && (
          <Link className="btn" to={`/lecciones/${id}/quiz`}>Practicar esta lección</Link>
        )}
      </div>

      {palabras.length === 0 ? (
        <p className="empty-state">Esta lección aún no tiene palabras.</p>
      ) : (
        <div className="card-grid">
          {palabras.map((p) => (
            <TarjetaPalabra
              key={p.id_palabra}
              palabra={p}
              dominada={dominadas.has(p.id_palabra)}
              onDominar={dominar}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default LeccionDetalle
