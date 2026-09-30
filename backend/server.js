require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');

const app = express();

app.use(cors());
app.use(express.json());

// ---- Login ----
app.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  const { data, error } = await supabase.rpc('verificar_login', {
    p_correo: correo,
    p_contrasena: contrasena,
  });

  if (error || !data || data.length === 0) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }

  res.json(data[0]);
});

// ---- Lecciones ----
app.get('/lecciones', async (req, res) => {
  const { data, error } = await supabase
    .from('lecciones')
    .select('id_leccion, titulo, orden')
    .order('orden');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---- Detalle de una lección (título + sus palabras) ----
app.get('/lecciones/:id', async (req, res) => {
  const { id } = req.params;

  const { data: leccion, error: errorLeccion } = await supabase
    .from('lecciones')
    .select('titulo')
    .eq('id_leccion', id)
    .single();

  if (errorLeccion) return res.status(500).json({ error: errorLeccion.message });

  const { data: filas, error: errorPalabras } = await supabase
    .from('leccion_palabras')
    .select('palabras(id_palabra, palabra_lengua_nativa, traduccion_espanol, dificultad)')
    .eq('id_leccion', id);

  if (errorPalabras) return res.status(500).json({ error: errorPalabras.message });

  const palabras = filas.map((f) => f.palabras);
  res.json({ titulo: leccion.titulo, palabras });
});

// ---- Palabras (listado completo, con categoría) ----
app.get('/palabras', async (req, res) => {
  const { data, error } = await supabase
    .from('palabras')
    .select('id_palabra, palabra_lengua_nativa, traduccion_espanol, dificultad, categorias(nombre)')
    .order('id_palabra');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---- Progreso (marcar palabra como dominada) ----
app.post('/progreso', async (req, res) => {
  const { id_usuario, id_palabra } = req.body;

  const { data, error } = await supabase
    .from('progreso')
    .upsert(
      {
        id_usuario,
        id_palabra,
        dominado: true,
        fecha_ultima_practica: new Date().toISOString().split('T')[0],
      },
      { onConflict: 'id_usuario,id_palabra' }
    )
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
