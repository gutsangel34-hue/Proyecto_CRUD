import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProgreso } from '../api'
import { useAuth } from '../AuthContext'

// Resumen del avance del estudiante (HU-09)
function Progreso() {
  const { usuario } = useAuth()
  const [progreso, setProgreso] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getProgreso(usuario.id_usuario).then(setProgreso).catch((err) => setError(err.message))
  }, [usuario.id_usuario])

  if (error) return <div className="page"><p className="error-text">{error}</p></div>
  if (!progreso) return <div className="page"><p className="empty-state">Cargando tu progreso...</p></div>

  const porcentaje = progreso.totalPalabras
    ? Math.round((progreso.dominadas / progreso.totalPalabras) * 100)
    : 0

  return (
    <div className="page">
      <h1>Mi progreso</h1>
      <h2 className="page-subtitle">Así vas, {usuario.nombre}</h2>

      <div className="stats">
        <div className="card stat">
          <span className="stat__numero">{progreso.dominadas}</span>
          <span className="stat__etiqueta">Palabras dominadas</span>
        </div>
        <div className="card stat">
          <span className="stat__numero">{progreso.practicadas}</span>
          <span className="stat__etiqueta">Palabras practicadas</span>
        </div>
        <div className="card stat">
          <span className="stat__numero">{porcentaje}%</span>
          <span className="stat__etiqueta">Del vocabulario ({progreso.totalPalabras} palabras)</span>
        </div>
      </div>

      <progress className="progreso__barra" value={progreso.dominadas} max={progreso.totalPalabras || 1} />

      {progreso.palabras.length === 0 ? (
        <p className="empty-state">
          Todavía no has practicado. <Link to="/lecciones">Empieza con una lección</Link>.
        </p>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr><th>Kankuamo</th><th>Español</th><th>Intentos</th><th>Última práctica</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {progreso.palabras.map((p) => (
                <tr key={p.id_palabra}>
                  <td className="tabla__nativa">{p.palabras.palabra_lengua_nativa}</td>
                  <td>{p.palabras.traduccion_espanol}</td>
                  <td>{p.intentos}</td>
                  <td>{p.fecha_ultima_practica || '—'}</td>
                  <td>
                    <span className={`badge ${p.dominado ? 'badge--ok' : ''}`}>
                      {p.dominado ? 'Dominada' : 'En práctica'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Progreso
