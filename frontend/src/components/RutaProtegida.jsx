import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

// Solo muestra su contenido si hay sesión (y, con soloAdmin, si el usuario es administrador).
function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/" />
  if (soloAdmin && usuario.rol !== 'admin') return <Navigate to="/lecciones" />
  return children
}

export default RutaProtegida
