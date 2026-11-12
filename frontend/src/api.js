// Todas las llamadas al backend pasan por este módulo.
// '/api' lo reenvía Vite al backend (ver vite.config.js)
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Hace la petición y devuelve el JSON; si el servidor responde con error, lo lanza.
async function pedir(ruta, opciones = {}) {
  const res = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...opciones.headers },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });
  if (res.status === 204) return null;
  const datos = await res.json().catch(() => null);
  if (!res.ok) throw new Error(datos?.error || 'No se pudo conectar con el servidor');
  return datos;
}

// ---- Usuarios ----
export async function login(correo, contrasena) {
  try {
    return await pedir('/login', { method: 'POST', body: { correo, contrasena } });
  } catch {
    return null;
  }
}

export function registrar(nombre, correo, contrasena) {
  return pedir('/registro', { method: 'POST', body: { nombre, correo, contrasena } });
}

// ---- Contenido ----
export function getCategorias() {
  return pedir('/categorias');
}

export async function getLecciones() {
  try {
    return await pedir('/lecciones');
  } catch {
    return [];
  }
}

export async function getLeccionDetalle(id) {
  try {
    return await pedir(`/lecciones/${id}`);
  } catch {
    return { titulo: '', palabras: [] };
  }
}

export function getPalabras({ q = '', categoria = '' } = {}) {
  const filtros = new URLSearchParams();
  if (q) filtros.set('q', q);
  if (categoria) filtros.set('categoria', categoria);
  return pedir(`/palabras?${filtros}`);
}

// ---- Progreso ----
export function getProgreso(idUsuario) {
  return pedir(`/progreso/${idUsuario}`);
}

export async function registrarPractica(idUsuario, idPalabra, dominado = true) {
  try {
    await pedir('/progreso', {
      method: 'POST',
      body: { id_usuario: idUsuario, id_palabra: idPalabra, dominado },
    });
    return true;
  } catch {
    return false;
  }
}

export function marcarComoDominada(idUsuario, idPalabra) {
  return registrarPractica(idUsuario, idPalabra, true);
}

// ---- Administración ----
export function getPalabrasAdmin(idAdmin) {
  return pedir('/admin/palabras', { headers: { 'x-id-usuario': idAdmin } });
}

export function guardarPalabraAdmin(idAdmin, palabra) {
  const editando = Boolean(palabra.id_palabra);
  return pedir(editando ? `/admin/palabras/${palabra.id_palabra}` : '/admin/palabras', {
    method: editando ? 'PUT' : 'POST',
    headers: { 'x-id-usuario': idAdmin },
    body: palabra,
  });
}

export function eliminarPalabraAdmin(idAdmin, idPalabra) {
  return pedir(`/admin/palabras/${idPalabra}`, {
    method: 'DELETE',
    headers: { 'x-id-usuario': idAdmin },
  });
}
