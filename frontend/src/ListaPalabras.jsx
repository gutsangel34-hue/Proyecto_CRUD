import { useEffect, useState } from 'react'
import { getPalabras, marcarComoDominada as marcarDominadaApi } from './api'

function ListaPalabras({ idUsuario }) {
  const [palabras, setPalabras] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarPalabras() {
      const data = await getPalabras()
      setPalabras(data)
      setCargando(false)
    }
    cargarPalabras()
  }, [])

  // función del paso 4, dentro del mismo componente
  async function marcarComoDominada(idPalabra) {
    const ok = await marcarDominadaApi(idUsuario, idPalabra)
    if (ok) alert('¡Palabra marcada como dominada!')
    else console.error('Error guardando progreso')
  }

  if (cargando) return <p>Cargando...</p>

  return (
    <ul>
      {palabras.map((p) => (
        <li key={p.id_palabra}>
          <strong>{p.palabra_lengua_nativa}</strong> — {p.traduccion_espanol} ({p.categorias.nombre})
          <button onClick={() => marcarComoDominada(p.id_palabra)}>Dominado ✓</button>
        </li>
      ))}
    </ul>
  )
}

export default ListaPalabras
