import { useEffect, useState } from 'react'
import { getCategorias, getPalabras } from '../api'
import TarjetaPalabra from '../components/TarjetaPalabra'

// Buscador de palabras con filtro por categoría (HU-04)
function Diccionario() {
  const [categorias, setCategorias] = useState([])
  const [palabras, setPalabras] = useState([])
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => setCategorias([]))
  }, [])

  // Vuelve a consultar al backend cuando cambia el texto o la categoría.
  // Se espera un momento para no pedir datos en cada tecla.
  useEffect(() => {
    const espera = setTimeout(async () => {
      try {
        setPalabras(await getPalabras({ q: texto.trim(), categoria }))
        setError('')
      } catch (err) {
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }, 300)
    return () => clearTimeout(espera)
  }, [texto, categoria])

  return (
    <div className="page">
      <h1>Diccionario</h1>
      <h2 className="page-subtitle">Busca en kankuamo o en español</h2>

      <div className="filtros">
        <input
          type="search"
          placeholder="Buscar palabra..."
          aria-label="Buscar palabra"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <select aria-label="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {error && <p className="error-text">{error}</p>}

      {cargando ? (
        <p className="empty-state">Cargando palabras...</p>
      ) : palabras.length === 0 ? (
        <p className="empty-state">No se encontraron palabras con esa búsqueda.</p>
      ) : (
        <>
          <p className="conteo">{palabras.length} {palabras.length === 1 ? 'palabra' : 'palabras'}</p>
          <div className="card-grid">
            {palabras.map((p) => <TarjetaPalabra key={p.id_palabra} palabra={p} />)}
          </div>
        </>
      )}
    </div>
  )
}

export default Diccionario
