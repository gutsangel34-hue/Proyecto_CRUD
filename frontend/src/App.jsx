import { Routes, Route, Navigate } from 'react-router-dom'
import RutaProtegida from './components/RutaProtegida'
import Layout from './components/Layout'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Lecciones from './pages/Lecciones'
import LeccionDetalle from './pages/LeccionDetalle'
import Quiz from './pages/Quiz'
import Diccionario from './pages/Diccionario'
import Progreso from './pages/Progreso'
import Admin from './pages/Admin'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Páginas que necesitan sesión: comparten la barra de navegación */}
      <Route element={<RutaProtegida><Layout /></RutaProtegida>}>
        <Route path="/lecciones" element={<Lecciones />} />
        <Route path="/lecciones/:id" element={<LeccionDetalle />} />
        <Route path="/lecciones/:id/quiz" element={<Quiz />} />
        <Route path="/diccionario" element={<Diccionario />} />
        <Route path="/progreso" element={<Progreso />} />
        <Route path="/admin" element={<RutaProtegida soloAdmin><Admin /></RutaProtegida>} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
