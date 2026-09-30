import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLecciones } from '../api'
import { useAuth } from '../AuthContext'

function Lecciones() {
  const [lecciones, setLecciones] = useState([])
  const [seleccionada, setSeleccionada] = useState('')
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function cargarLecciones() {
      const data = await getLecciones()
      setLecciones(data)
    }
    cargarLecciones()
  }, [])

  function irALeccion(e) {
    e.preventDefault()
    if (seleccionada) navigate(`/lecciones/${seleccionada}`)
  }

  return (
    <div className="page">
      <div className="topbar">
        <h1>Hola, {usuario?.nombre}</h1>
        <button className="btn-ghost" onClick={() => { cerrarSesion(); navigate('/') }}>
          Cerrar sesión
        </button>
      </div>

      <h2>Elige una lección</h2>
      <form className="selector-leccion" onSubmit={irALeccion}>
        <select value={seleccionada} onChange={(e) => setSeleccionada(e.target.value)}>
          <option value="">-- Selecciona --</option>
          {lecciones.map((l) => (
            <option key={l.id_leccion} value={l.id_leccion}>{l.titulo}</option>
          ))}
        </select>
        <button className="btn-select" type="submit">Empezar</button>
      </form>

      {lecciones.length === 0 ? (
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
