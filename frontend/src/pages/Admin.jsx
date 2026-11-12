import { useEffect, useState } from 'react'
import { getCategorias, getPalabrasAdmin, guardarPalabraAdmin } from '../api'
import { useAuth } from '../AuthContext'

const PALABRA_VACIA = {
  id_palabra: null,
  palabra_lengua_nativa: '',
  traduccion_espanol: '',
  id_categoria: '',
  dificultad: 'facil',
  audio_url: '',
  validada: false,
}

// Gestión del contenido: agregar, editar y validar palabras (HU-03 y HU-06)
function Admin() {
  const { usuario } = useAuth()
  const [categorias, setCategorias] = useState([])
  const [palabras, setPalabras] = useState([])
  const [formulario, setFormulario] = useState(PALABRA_VACIA)
  const [soloPendientes, setSoloPendientes] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  async function cargar() {
    try {
      const [cats, lista] = await Promise.all([getCategorias(), getPalabrasAdmin(usuario.id_usuario)])
      setCategorias(cats)
      setPalabras(lista)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function cambiar(campo, valor) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')
    setMensaje('')
    try {
      await guardarPalabraAdmin(usuario.id_usuario, formulario)
      setMensaje(formulario.id_palabra ? 'Palabra actualizada.' : 'Palabra agregada.')
      setFormulario(PALABRA_VACIA)
      await cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  async function cambiarValidada(palabra) {
    setError('')
    try {
      await guardarPalabraAdmin(usuario.id_usuario, { ...palabra, validada: !palabra.validada })
      await cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  function editar(palabra) {
    setFormulario({ ...palabra, audio_url: palabra.audio_url || '' })
    setMensaje('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const visibles = soloPendientes ? palabras.filter((p) => !p.validada) : palabras
  const pendientes = palabras.filter((p) => !p.validada).length

  return (
    <div className="page">
      <h1>Administrar palabras</h1>
      <h2 className="page-subtitle">
        {palabras.length} palabras · {pendientes} sin validar
      </h2>

      <form className="card admin-form" onSubmit={guardar}>
        <h3>{formulario.id_palabra ? 'Editar palabra' : 'Agregar palabra'}</h3>
        <div className="admin-form__grid">
          <div className="field">
            <label htmlFor="nativa">Palabra en kankuamo</label>
            <input id="nativa" value={formulario.palabra_lengua_nativa}
              onChange={(e) => cambiar('palabra_lengua_nativa', e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="espanol">Traducción al español</label>
            <input id="espanol" value={formulario.traduccion_espanol}
              onChange={(e) => cambiar('traduccion_espanol', e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="categoria">Categoría</label>
            <select id="categoria" value={formulario.id_categoria}
              onChange={(e) => cambiar('id_categoria', e.target.value)} required>
              <option value="">-- Selecciona --</option>
              {categorias.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="dificultad">Dificultad</label>
            <select id="dificultad" value={formulario.dificultad}
              onChange={(e) => cambiar('dificultad', e.target.value)}>
              <option value="facil">Fácil</option>
              <option value="medio">Medio</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
          <div className="field admin-form__ancho">
            <label htmlFor="audio">Enlace del audio (opcional)</label>
            <input id="audio" type="url" placeholder="https://..." value={formulario.audio_url}
              onChange={(e) => cambiar('audio_url', e.target.value)} />
          </div>
        </div>
        <label className="check">
          <input type="checkbox" checked={formulario.validada}
            onChange={(e) => cambiar('validada', e.target.checked)} />
          Validada por un sabedor o mayor (se muestra a los estudiantes)
        </label>
        <div className="admin-form__acciones">
          <button type="submit">{formulario.id_palabra ? 'Guardar cambios' : 'Agregar palabra'}</button>
          {formulario.id_palabra && (
            <button type="button" className="btn-ghost" onClick={() => setFormulario(PALABRA_VACIA)}>
              Cancelar
            </button>
          )}
        </div>
        {mensaje && <p className="ok-text" role="status">{mensaje}</p>}
        {error && <p className="error-text">{error}</p>}
      </form>

      <label className="check">
        <input type="checkbox" checked={soloPendientes} onChange={(e) => setSoloPendientes(e.target.checked)} />
        Ver solo las que faltan por validar
      </label>

      <div className="tabla-scroll">
        <table className="tabla">
          <thead>
            <tr><th>Kankuamo</th><th>Español</th><th>Categoría</th><th>Audio</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {visibles.map((p) => (
              <tr key={p.id_palabra}>
                <td className="tabla__nativa">{p.palabra_lengua_nativa}</td>
                <td>{p.traduccion_espanol}</td>
                <td>{p.categorias?.nombre}</td>
                <td>{p.audio_url ? 'Sí' : 'Pendiente'}</td>
                <td>
                  <span className={`badge ${p.validada ? 'badge--ok' : 'badge--pendiente'}`}>
                    {p.validada ? 'Validada' : 'Sin validar'}
                  </span>
                </td>
                <td className="tabla__acciones">
                  <button className="btn-mini" onClick={() => editar(p)}>Editar</button>
                  <button className="btn-mini" onClick={() => cambiarValidada(p)}>
                    {p.validada ? 'Quitar validación' : 'Validar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Admin
