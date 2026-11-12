import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

// Barra de navegación común a todas las páginas con sesión.
function Layout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  function salir() {
    cerrarSesion()
    navigate('/')
  }

  return (
    <>
      <header className="navbar">
        <div className="navbar__inner">
          <span className="navbar__marca">Ecos Nativos</span>
          <nav className="navbar__links" aria-label="Principal">
            <NavLink to="/lecciones">Lecciones</NavLink>
            <NavLink to="/diccionario">Diccionario</NavLink>
            <NavLink to="/progreso">Mi progreso</NavLink>
            {usuario.rol === 'admin' && <NavLink to="/admin">Administrar</NavLink>}
          </nav>
          <div className="navbar__usuario">
            <span>{usuario.nombre}</span>
            <button className="btn-ghost" onClick={salir}>Salir</button>
          </div>
        </div>
      </header>
      <Outlet />
    </>
  )
}

export default Layout
