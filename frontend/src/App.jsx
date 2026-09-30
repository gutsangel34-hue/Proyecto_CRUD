import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Login from './pages/Login'
import Lecciones from './pages/Lecciones'
import LeccionDetalle from './pages/LeccionDetalle'
import './App.css'

function RutaProtegida({ children }) {
  const { usuario } = useAuth()
  return usuario ? children : <Navigate to="/" />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/lecciones" element={
        <RutaProtegida><Lecciones /></RutaProtegida>
      } />
      <Route path="/lecciones/:id" element={
        <RutaProtegida><LeccionDetalle /></RutaProtegida>
      } />
    </Routes>
  )
}

export default App
