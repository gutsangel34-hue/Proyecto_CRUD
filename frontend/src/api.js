const API_URL = 'http://localhost:3000';

export async function login(correo, contrasena) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getLecciones() {
  const res = await fetch(`${API_URL}/lecciones`);
  if (!res.ok) return [];
  return res.json();
}

export async function getLeccionDetalle(id) {
  const res = await fetch(`${API_URL}/lecciones/${id}`);
  if (!res.ok) return { titulo: '', palabras: [] };
  return res.json();
}

export async function getPalabras() {
  const res = await fetch(`${API_URL}/palabras`);
  if (!res.ok) return [];
  return res.json();
}

export async function marcarComoDominada(idUsuario, idPalabra) {
  const res = await fetch(`${API_URL}/progreso`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario: idUsuario, id_palabra: idPalabra }),
  });
  return res.ok;
}
