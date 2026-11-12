import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrar } from '../api'
import { useAuth } from '../AuthContext'

function Registro() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  async function manejarRegistro(e) {
    e.preventDefault()
    setError('')

    try {
      const usuario = await registrar(nombre, correo, contrasena)
      iniciarSesion(usuario)
      navigate('/lecciones')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page page--auth">
      <div className="auth-card">
        <span className="auth-card__brand" aria-hidden="true" />
        <h1>Crear cuenta</h1>
        <p className="auth-card__lema">Guarda tu avance en Ecos Nativos</p>
        <form onSubmit={manejarRegistro}>
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
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
            <label htmlFor="contrasena">Contraseña (mínimo 6 caracteres)</label>
            <input
              id="contrasena"
              type="password"
              minLength={6}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
          <button type="submit">Crear cuenta</button>
        </form>
        {error && <p className="error-text">{error}</p>}
        <p className="auth-card__pie">¿Ya tienes cuenta? <Link to="/">Iniciar sesión</Link></p>
      </div>
    </div>
  )
}

export default Registro
