// backend.js — supabaseClient.js y server.js del diagrama UML.

// ---------- «módulo» supabaseClient.js ----------
class SupabaseClient {
  constructor(url, key) {
    this.url = url;   // string  (process.env.SUPABASE_URL)
    this.key = key;   // string  (process.env.SUPABASE_KEY)
  }

  // Dependencia → BaseDeDatos: la recibe como parámetro, no la guarda.
  select(bd, tabla, filtro = () => true) {
    return bd[tabla].filter(filtro);                          // object[]
  }

  rpc(bd, nombreFuncion, argumentos) {                        // object[]
    if (nombreFuncion === 'verificar_login') {
      return bd.verificarLogin.verificar_login(argumentos.p_correo, argumentos.p_contrasena, bd.usuarios);
    }
    throw new Error('Función no existe: ' + nombreFuncion);
  }

  upsert(bd, tabla, fila, claves) {                           // object
    const existente = bd[tabla].find((f) => claves.every((c) => f[c] === fila[c]));
    if (existente) { Object.assign(existente, fila); return existente; }
    const nuevo = { id_progreso: bd[tabla].length + 1, intentos: 0, ...fila };
    bd[tabla].push(nuevo);
    return nuevo;
  }
}

// ---------- «servidor» server.js ----------
class Servidor {
  #supabase;  // Asociación (1): el servidor usa un supabaseClient
  #bd;

  constructor(supabase, bd, port = 3000) {
    this.app = {};          // object (Express)
    this.PORT = port;       // string | number
    this.#supabase = supabase;
    this.#bd = bd;
  }

  // POST /login
  async postLogin(req, res) {
    const { correo, contrasena } = req.body;
    const data = this.#supabase.rpc(this.#bd, 'verificar_login', { p_correo: correo, p_contrasena: contrasena });
    if (!data || data.length === 0) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    res.json(data[0]);
  }

  // GET /lecciones
  async getLecciones(req, res) {
    const data = this.#supabase.select(this.#bd, 'lecciones')
      .map(({ id_leccion, titulo, orden }) => ({ id_leccion, titulo, orden }))
      .sort((a, b) => a.orden - b.orden);
    res.json(data);
  }

  // GET /lecciones/:id
  async getLeccionPorId(req, res) {
    const id = Number(req.params.id);
    const [leccion] = this.#supabase.select(this.#bd, 'lecciones', (l) => l.id_leccion === id);
    if (!leccion) return res.status(500).json({ error: 'Lección no encontrada' });
    const filas = this.#supabase.select(this.#bd, 'leccion_palabras', (f) => f.id_leccion === id);
    const palabras = filas.map((f) => this.#supabase.select(this.#bd, 'palabras', (p) => p.id_palabra === f.id_palabra)[0]);
    res.json({ titulo: leccion.titulo, palabras });
  }

  // GET /palabras
  async getPalabras(req, res) {
    const data = this.#supabase.select(this.#bd, 'palabras').map((p) => ({
      ...p,
      categorias: { nombre: this.#supabase.select(this.#bd, 'categorias', (c) => c.id_categoria === p.id_categoria)[0].nombre },
    }));
    res.json(data);
  }

  // POST /progreso
  async postProgreso(req, res) {
    const { id_usuario, id_palabra } = req.body;
    const fila = {
      id_usuario, id_palabra, dominado: true,
      fecha_ultima_practica: new Date().toISOString().split('T')[0],
    };
    const data = this.#supabase.upsert(this.#bd, 'progreso', fila, ['id_usuario', 'id_palabra']);
    res.status(201).json([data]);
  }

  // Simula la llegada de una petición HTTP (lo que haría Express) y la dirige a su ruta.
  async manejar(metodo, ruta, body = {}) {
    let estado = 200, cuerpo;
    const res = { status(c) { estado = c; return res; }, json(d) { cuerpo = d; }, send() {} };
    const req = { body, params: {} };
    const m = ruta.match(/^\/lecciones\/(\d+)$/);
    if (metodo === 'POST' && ruta === '/login') await this.postLogin(req, res);
    else if (metodo === 'GET' && ruta === '/lecciones') await this.getLecciones(req, res);
    else if (metodo === 'GET' && m) { req.params.id = m[1]; await this.getLeccionPorId(req, res); }
    else if (metodo === 'GET' && ruta === '/palabras') await this.getPalabras(req, res);
    else if (metodo === 'POST' && ruta === '/progreso') await this.postProgreso(req, res);
    else { estado = 404; cuerpo = { error: 'Ruta no encontrada' }; }
    return { ok: estado < 400, status: estado, json: async () => cuerpo };
  }
}

module.exports = { SupabaseClient, Servidor };
