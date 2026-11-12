import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api'
import { useAuth } from '../AuthContext'

function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  async function manejarLogin(e) {
    e.preventDefault()
    setError('')

    const usuario = await login(correo, contrasena)

    if (!usuario) {
      setError('Correo o contraseña incorrectos')
      return
    }

    iniciarSesion(usuario)
    navigate('/lecciones')
  }

  return (
    <div className="page page--auth">
      <div className="auth-card">
        <span className="auth-card__brand" aria-hidden="true" />
        <h1>Ecos Nativos</h1>
        <p className="auth-card__lema">Aprende la lengua kankuama</p>
        <form onSubmit={manejarLogin}>
          <div className="field">
            <label htmlFor="correo">Correo</label>
            <input
              id="correo"
              type="email"
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
          <button type="submit">Entrar</button>
        </form>
        {error && <p className="error-text">{error}</p>}
        <p className="auth-card__pie">¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link></p>
      </div>
    </div>
  )
}

export default Login
