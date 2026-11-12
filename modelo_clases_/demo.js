// demo.js — arma el sistema completo del diagrama UML y recorre el flujo:
// login → lista de lecciones → detalle de una lección → marcar palabra como dominada.
const { Categoria, Palabra, Leccion, LeccionPalabra, Usuario, BaseDeDatos } = require('./modelo');
const { SupabaseClient, Servidor } = require('./backend');
const { Api, Lecciones, LeccionDetalle, App, AuthContext, Main } = require('./frontend');

(async () => {
  // ---- Base de datos con datos de ejemplo (cambia los textos por tus palabras reales) ----
  const bd = new BaseDeDatos();
  const cat = new Categoria(1, 'Saludos', 'Palabras para saludar');
  const p1 = new Palabra(1, cat, 'palabra_1', 'hola', 'https://audio/1.mp3');
  const p2 = new Palabra(2, cat, 'palabra_2', 'gracias', 'https://audio/2.mp3', 'medio');
  const lec = new Leccion(1, cat, 'Lección 1: Saludos', 1);
  const ana = new Usuario(1, 'Ana', 'ana@correo.com', '1234');
  bd.categorias.push(cat);
  bd.palabras.push(p1, p2);
  bd.lecciones.push(lec);
  bd.leccion_palabras.push(new LeccionPalabra(lec, p1), new LeccionPalabra(lec, p2));
  bd.usuarios.push(ana);

  // ---- Backend: supabaseClient + server ----
  const supabase = new SupabaseClient('https://ftmyktwgpqhxpdsdmtjt.supabase.co', 'clave-publicable');
  const servidor = new Servidor(supabase, bd);

  // fetch del navegador → se redirige al servidor (simula la red)
  globalThis.fetch = (url, opciones = {}) =>
    servidor.manejar(opciones.method || 'GET', url.replace('http://localhost:3000', ''),
                     opciones.body ? JSON.parse(opciones.body) : {});

  // ---- Frontend ----
  const api = new Api();
  const lecciones = new Lecciones();
  const detalle = new LeccionDetalle();
  const app = new App(lecciones, detalle);
  const auth = new AuthContext(app);
  const main = new Main(app, auth);

  console.log(main.render('/lecciones'));               // sin sesión → redirige a /

  app.login.correo = 'ana@correo.com';
  app.login.contrasena = '1234';
  await app.login.manejarLogin(auth, api);              // POST /login
  console.log('Sesión de:', auth.usuario);

  await lecciones.cargarLecciones(api);                 // GET /lecciones
  console.log(main.render('/lecciones'));

  lecciones.seleccionada = '1';
  console.log('Ir a:', lecciones.irALeccion());

  await detalle.cargarDatos(1, api);                    // GET /lecciones/1
  console.log(main.render('/lecciones/1'));

  await detalle.marcarComoDominada(1, auth, api);       // POST /progreso
  console.log('Progreso guardado:', bd.progreso);

  auth.cerrarSesion();
  console.log(main.render('/lecciones'));
})();
