// frontend.js — api.js, AuthContext.jsx, main.jsx, App.jsx y pages/ del diagrama UML.
// render() devuelve texto en lugar de JSX.

// ---------- «módulo» api.js ----------  (dependencia → server: HTTP fetch)
class Api {
  constructor() {
    this.API_URL = 'http://localhost:3000';   // string
  }

  async login(correo, contrasena) {                       // Promise<object | null>
    const res = await fetch(`${this.API_URL}/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena }),
    });
    if (!res.ok) return null;
    return res.json();
  }

  async getLecciones() {                                  // Promise<object[]>
    const res = await fetch(`${this.API_URL}/lecciones`);
    if (!res.ok) return [];
    return res.json();
  }

  async getLeccionDetalle(id) {                           // Promise<object>
    const res = await fetch(`${this.API_URL}/lecciones/${id}`);
    if (!res.ok) return { titulo: '', palabras: [] };
    return res.json();
  }

  async getPalabras() {                                   // Promise<object[]>
    const res = await fetch(`${this.API_URL}/palabras`);
    if (!res.ok) return [];
    return res.json();
  }

  async marcarComoDominada(idUsuario, idPalabra) {        // Promise<boolean>
    const res = await fetch(`${this.API_URL}/progreso`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario: idUsuario, id_palabra: idPalabra }),
    });
    return res.ok;
  }
}

// ---------- «página» pages/Login.jsx ----------  (dependencia → AuthContext y api)
class Login {
  constructor() {
    this.correo = '';        // string
    this.contrasena = '';    // string
    this.error = '';         // string
  }

  async manejarLogin(auth, api) {                         // Promise<void>
    this.error = '';
    const usuario = await api.login(this.correo, this.contrasena);
    if (!usuario) { this.error = 'Correo o contraseña incorrectos'; return; }
    auth.iniciarSesion(usuario);
  }

  render() { return `[Login] Aprende Kankuamo ${this.error}`; }
}

// ---------- «página» pages/Lecciones.jsx ----------  (dependencia → AuthContext y api)
class Lecciones {
  constructor() {
    this.lecciones = [];       // object[]
    this.seleccionada = '';    // string
  }

  async cargarLecciones(api) { this.lecciones = await api.getLecciones(); }

  irALeccion() { return this.seleccionada ? `/lecciones/${this.seleccionada}` : null; }   // string | null

  render(auth) {
    return `[Lecciones] Hola, ${auth.usuario?.nombre} → ${this.lecciones.map((l) => `${l.orden}. ${l.titulo}`).join(' | ')}`;
  }
}

// ---------- «página» pages/LeccionDetalle.jsx ----------  (dependencia → AuthContext y api)
class LeccionDetalle {
  constructor() {
    this.leccion = null;   // object | null
    this.palabras = [];    // object[]
  }

  async cargarDatos(id, api) {
    const detalle = await api.getLeccionDetalle(id);
    this.leccion = { titulo: detalle.titulo };
    this.palabras = detalle.palabras;
  }

  async marcarComoDominada(idPalabra, auth, api) {        // Promise<void>
    await api.marcarComoDominada(auth.usuario.id_usuario, idPalabra);
  }

  render() {
    return `[LeccionDetalle] ${this.leccion?.titulo}: ` +
      this.palabras.map((p) => `${p.palabra_lengua_nativa} = ${p.traduccion_espanol}`).join(', ');
  }
}

// ---------- «componente» ListaPalabras.jsx ----------  (dependencia → api; App no lo usa)
class ListaPalabras {
  constructor(idUsuario) {
    this.idUsuario = idUsuario;   // number
    this.palabras = [];           // object[]
    this.cargando = true;         // boolean
  }

  async cargarPalabras(api) { this.palabras = await api.getPalabras(); this.cargando = false; }

  async marcarComoDominada(idPalabra, api) { return api.marcarComoDominada(this.idUsuario, idPalabra); }   // Promise<boolean>
}

// ---------- «componente» RutaProtegida (App.jsx) ----------
// Agregación ◇: recibe Lecciones y LeccionDetalle ya creadas (children), no las crea.
class RutaProtegida {
  #lecciones;
  #leccionDetalle;

  constructor(lecciones, leccionDetalle) {
    this.#lecciones = lecciones;
    this.#leccionDetalle = leccionDetalle;
  }

  // Dependencia → AuthContext (useAuth): solo muestra las páginas si hay usuario
  render(ruta, auth) {                                    // string
    if (!auth.usuario) return '[Navigate] → /';
    return ruta === '/lecciones' ? this.#lecciones.render(auth) : this.#leccionDetalle.render();
  }
}

// ---------- «componente» App.jsx ----------
// Composición ◆: App crea Login y RutaProtegida y estos no existen sin ella.
class App {
  #login;
  #rutaProtegida;

  constructor(lecciones, leccionDetalle) {
    this.#login = new Login();
    this.#rutaProtegida = new RutaProtegida(lecciones, leccionDetalle);
  }

  get login() { return this.#login; }

  App(ruta, auth) {                                       // string (JSX)
    return ruta === '/' ? this.#login.render() : this.#rutaProtegida.render(ruta, auth);
  }
}

// ---------- «contexto» AuthContext.jsx ----------
// Agregación ◇: AuthContext envuelve (children) a una App que ya existe.
class AuthContext {
  #app;

  constructor(app) {
    this.#app = app;
    this.usuario = null;   // object | null
  }

  iniciarSesion(datosUsuario) { this.usuario = datosUsuario; }   // void
  cerrarSesion() { this.usuario = null; }                        // void
  useAuth() { return this; }                                     // object
  render(ruta) { return this.#app.App(ruta, this); }             // string
}

// ---------- «entrada» main.jsx ----------
// Asociación → App y → AuthContext
class Main {
  #app;
  #auth;

  constructor(app, auth) {
    this.#app = app;
    this.#auth = auth;
  }

  render(ruta = '/') { return this.#auth.render(ruta); }        // string
}

module.exports = { Api, Login, Lecciones, LeccionDetalle, ListaPalabras, RutaProtegida, App, AuthContext, Main };
