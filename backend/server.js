require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');

const app = express();

app.use(cors());
app.use(express.json());

const CAMPOS_PALABRA =
  'id_palabra, id_categoria, palabra_lengua_nativa, traduccion_espanol, dificultad, audio_url';

// =====================================================
// Usuarios: login y registro (HU-08)
// =====================================================

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

app.post('/registro', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
  }
  if (contrasena.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const { data, error } = await supabase.rpc('registrar_usuario', {
    p_nombre: nombre,
    p_correo: correo,
    p_contrasena: contrasena,
  });

  if (error) {
    const yaExiste = error.message.includes('ya está registrado');
    return res.status(yaExiste ? 409 : 500).json({ error: error.message });
  }

  res.status(201).json(data[0]);
});

// =====================================================
// Contenido: categorías, lecciones y palabras
// Solo se muestran las palabras validadas (HU-03)
// =====================================================

app.get('/categorias', async (req, res) => {
  const { data, error } = await supabase
    .from('categorias')
    .select('id_categoria, nombre, descripcion')
    .order('nombre');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/lecciones', async (req, res) => {
  const { data, error } = await supabase
    .from('lecciones')
    .select('id_leccion, titulo, orden')
    .order('orden');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Detalle de una lección (título + sus palabras validadas)
app.get('/lecciones/:id', async (req, res) => {
  const { id } = req.params;

  const { data: leccion, error: errorLeccion } = await supabase
    .from('lecciones')
    .select('titulo')
    .eq('id_leccion', id)
    .single();

  if (errorLeccion) return res.status(404).json({ error: 'Lección no encontrada' });

  const { data: filas, error: errorPalabras } = await supabase
    .from('leccion_palabras')
    .select(`palabras!inner(${CAMPOS_PALABRA}, validada)`)
    .eq('id_leccion', id)
    .eq('palabras.validada', true);

  if (errorPalabras) return res.status(500).json({ error: errorPalabras.message });

  const palabras = filas
    .map((f) => f.palabras)
    .sort((a, b) => a.id_palabra - b.id_palabra);
  res.json({ titulo: leccion.titulo, palabras });
});

// Diccionario con búsqueda por texto y filtro por categoría (HU-04)
//   GET /palabras?q=sol&categoria=3
app.get('/palabras', async (req, res) => {
  const { categoria } = req.query;
  // Se quitan los caracteres que tienen significado en los filtros de Supabase
  const q = (req.query.q || '').replace(/[%,()*\\]/g, '').trim();

  let consulta = supabase
    .from('palabras')
    .select(`${CAMPOS_PALABRA}, categorias(nombre)`)
    .eq('validada', true)
    .order('palabra_lengua_nativa');

  if (categoria) consulta = consulta.eq('id_categoria', categoria);
  if (q) {
    consulta = consulta.or(
      `palabra_lengua_nativa.ilike.%${q}%,traduccion_espanol.ilike.%${q}%`
    );
  }

  const { data, error } = await consulta;

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// =====================================================
// Progreso del estudiante (HU-09)
// =====================================================

// Resumen: cuántas palabras ha practicado y cuántas domina
app.get('/progreso/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;

  const [{ data: filas, error }, { count: totalPalabras, error: errorTotal }] = await Promise.all([
    supabase
      .from('progreso')
      .select(
        'id_palabra, dominado, intentos, fecha_ultima_practica, palabras(palabra_lengua_nativa, traduccion_espanol, categorias(nombre))'
      )
      .eq('id_usuario', idUsuario)
      .order('fecha_ultima_practica', { ascending: false }),
    supabase.from('palabras').select('*', { count: 'exact', head: true }).eq('validada', true),
  ]);

  if (error || errorTotal) {
    return res.status(500).json({ error: (error || errorTotal).message });
  }

  res.json({
    totalPalabras,
    practicadas: filas.length,
    dominadas: filas.filter((f) => f.dominado).length,
    palabras: filas,
  });
});

// Registrar una práctica. dominado = true cuando la respuesta fue correcta
// o el estudiante marcó la palabra como dominada.
app.post('/progreso', async (req, res) => {
  const { id_usuario, id_palabra, dominado = true } = req.body;

  if (!id_usuario || !id_palabra) {
    return res.status(400).json({ error: 'id_usuario e id_palabra son obligatorios' });
  }

  const { data: anterior } = await supabase
    .from('progreso')
    .select('dominado, intentos')
    .eq('id_usuario', id_usuario)
    .eq('id_palabra', id_palabra)
    .maybeSingle();

  const { data, error } = await supabase
    .from('progreso')
    .upsert(
      {
        id_usuario,
        id_palabra,
        // Una palabra ya dominada no se pierde por fallar una vez
        dominado: Boolean(dominado) || Boolean(anterior?.dominado),
        intentos: (anterior?.intentos || 0) + 1,
        fecha_ultima_practica: new Date().toISOString().split('T')[0],
      },
      { onConflict: 'id_usuario,id_palabra' }
    )
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// =====================================================
// Administración de palabras (HU-06)
// El id del usuario llega en la cabecera x-id-usuario
// =====================================================

async function soloAdmin(req, res, next) {
  const idUsuario = Number(req.header('x-id-usuario'));
  if (!idUsuario) return res.status(401).json({ error: 'Debes iniciar sesión' });

  const { data: esAdmin, error } = await supabase.rpc('es_admin', { p_id_usuario: idUsuario });

  if (error) return res.status(500).json({ error: error.message });
  if (!esAdmin) return res.status(403).json({ error: 'Solo el administrador puede hacer esto' });

  req.idAdmin = idUsuario;
  next();
}

// Todas las palabras, validadas o no
app.get('/admin/palabras', soloAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('palabras')
    .select(`${CAMPOS_PALABRA}, validada, categorias(nombre)`)
    .order('id_palabra', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

async function guardarPalabra(req, res, idPalabra) {
  const { palabra_lengua_nativa, traduccion_espanol, id_categoria, dificultad, audio_url, validada } =
    req.body;

  if (!palabra_lengua_nativa || !traduccion_espanol || !id_categoria) {
    return res.status(400).json({ error: 'Palabra, traducción y categoría son obligatorias' });
  }

  const { data, error } = await supabase.rpc('admin_guardar_palabra', {
    p_id_admin: req.idAdmin,
    p_id_palabra: idPalabra,
    p_id_categoria: Number(id_categoria),
    p_nativa: palabra_lengua_nativa.trim(),
    p_espanol: traduccion_espanol.trim(),
    p_dificultad: dificultad || 'facil',
    p_audio_url: audio_url || '',
    p_validada: Boolean(validada),
  });

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ error: 'Palabra no encontrada' });
  res.status(idPalabra ? 200 : 201).json(data[0]);
}

app.post('/admin/palabras', soloAdmin, (req, res) => guardarPalabra(req, res, null));
app.put('/admin/palabras/:id', soloAdmin, (req, res) =>
  guardarPalabra(req, res, Number(req.params.id))
);

// Eliminar una palabra (también borra su progreso y su lugar en las lecciones)
app.delete('/admin/palabras/:id', soloAdmin, async (req, res) => {
  const { data, error } = await supabase.rpc('admin_eliminar_palabra', {
    p_id_admin: req.idAdmin,
    p_id_palabra: Number(req.params.id),
  });

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Palabra no encontrada' });
  res.status(204).send();
});

// =====================================================
// Arrancar servidor
// =====================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
