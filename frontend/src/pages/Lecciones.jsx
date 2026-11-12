import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLecciones } from '../api'
import { useAuth } from '../AuthContext'

function Lecciones() {
  const [lecciones, setLecciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const { usuario } = useAuth()

  useEffect(() => {
    async function cargarLecciones() {
      setLecciones(await getLecciones())
      setCargando(false)
    }
    cargarLecciones()
  }, [])

  return (
    <div className="page">
      <h1>Hola, {usuario.nombre}</h1>
      <h2 className="page-subtitle">Elige una lección</h2>

      {cargando ? (
        <p className="empty-state">Cargando lecciones...</p>
      ) : lecciones.length === 0 ? (
        <p className="empty-state">Aún no hay lecciones disponibles.</p>
      ) : (
        <div className="card-grid">
          {lecciones.map((l) => (
            <Link key={l.id_leccion} to={`/lecciones/${l.id_leccion}`} className="card lesson-card">
              <span className="lesson-card__orden">{l.orden}</span>
              <span className="lesson-card__titulo">{l.titulo}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Lecciones
