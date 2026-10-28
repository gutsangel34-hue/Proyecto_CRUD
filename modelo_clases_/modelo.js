// modelo.js — «base de datos» Supabase (app-lengua-nativa): las 6 tablas, la función SQL
// y la base que las contiene. Representa el recuadro inferior del diagrama UML.
// Tipos de dato = tipos de JavaScript (number, string, boolean).

// ---------- «tabla» categorias ----------
class Categoria {
  constructor(id_categoria, nombre, descripcion) {
    this.id_categoria = id_categoria;   // PK: number
    this.nombre = nombre;               // string
    this.descripcion = descripcion;     // string
  }
}

// ---------- «tabla» palabras ----------  (0..*) palabras → (1) categoria
class Palabra {
  constructor(id_palabra, categoria, palabra_lengua_nativa, traduccion_espanol, audio_url, dificultad = 'facil') {
    if (!(categoria instanceof Categoria)) throw new Error('Palabra necesita una Categoria');
    this.id_palabra = id_palabra;                       // PK: number
    this.id_categoria = categoria.id_categoria;         // FK: number
    this.palabra_lengua_nativa = palabra_lengua_nativa; // string
    this.traduccion_espanol = traduccion_espanol;       // string
    this.audio_url = audio_url;                         // string
    this.dificultad = dificultad;                       // string
  }
}

// ---------- «tabla» lecciones ----------  (0..*) lecciones → (1) categoria
class Leccion {
  constructor(id_leccion, categoria, titulo, orden) {
    if (!(categoria instanceof Categoria)) throw new Error('Leccion necesita una Categoria');
    this.id_leccion = id_leccion;               // PK: number
    this.id_categoria = categoria.id_categoria; // FK: number
    this.titulo = titulo;                       // string
    this.orden = orden;                         // number
  }
}

// ---------- «tabla» leccion_palabras ----------  (0..*) → (1) leccion y (0..*) → (1) palabra
class LeccionPalabra {
  constructor(leccion, palabra) {
    if (!(leccion instanceof Leccion)) throw new Error('LeccionPalabra necesita una Leccion');
    if (!(palabra instanceof Palabra)) throw new Error('LeccionPalabra necesita una Palabra');
    this.id_leccion = leccion.id_leccion;   // PK,FK: number
    this.id_palabra = palabra.id_palabra;   // PK,FK: number
  }
}

// ---------- «tabla» usuarios ----------
class Usuario {
  constructor(id_usuario, nombre, correo, contrasena, fecha_registro = new Date().toISOString().split('T')[0]) {
    this.id_usuario = id_usuario;           // PK: number
    this.nombre = nombre;                   // string
    this.correo = correo;                   // string (único)
    this.fecha_registro = fecha_registro;   // string ('AAAA-MM-DD')
    this.contrasena = contrasena;           // string
  }
}

// ---------- «tabla» progreso ----------  (0..*) → (1) usuario y (0..*) → (1) palabra
class Progreso {
  constructor(id_progreso, usuario, palabra) {
    if (!(usuario instanceof Usuario)) throw new Error('Progreso necesita un Usuario');
    if (!(palabra instanceof Palabra)) throw new Error('Progreso necesita una Palabra');
    this.id_progreso = id_progreso;         // PK: number
    this.id_usuario = usuario.id_usuario;   // FK: number
    this.id_palabra = palabra.id_palabra;   // FK: number
    this.dominado = false;                  // boolean
    this.fecha_ultima_practica = null;      // string
    this.intentos = 0;                      // number
  }
}

// ---------- «función» verificar_login ----------  (dependencia → usuarios)
class VerificarLogin {
  // Recibe la tabla usuarios como parámetro: solo la usa, no la guarda (dependencia)
  verificar_login(p_correo, p_contrasena, usuarios) {
    return usuarios
      .filter((u) => u.correo === p_correo && u.contrasena === p_contrasena)
      .map((u) => ({ id_usuario: u.id_usuario, nombre: u.nombre, correo: u.correo })); // object[]
  }
}

// ---------- «base de datos» Supabase (PostgreSQL) ----------
// Composición: las tablas y la función no existen fuera de la base.
class BaseDeDatos {
  constructor() {
    this.categorias = [];          // Categoria[]
    this.palabras = [];            // Palabra[]
    this.lecciones = [];           // Leccion[]
    this.leccion_palabras = [];    // LeccionPalabra[]
    this.usuarios = [];            // Usuario[]
    this.progreso = [];            // Progreso[]
    this.verificarLogin = new VerificarLogin();
  }
}

module.exports = { Categoria, Palabra, Leccion, LeccionPalabra, Usuario, Progreso, VerificarLogin, BaseDeDatos };
