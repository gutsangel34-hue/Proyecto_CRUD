// modelo.js — Ecos Nativos: clases del dominio
// Los tipos de dato se documentan con JSDoc y coinciden con el diagrama UML.
const crypto = require('node:crypto');

// Tabla: categorias
class Categoria {
  /**
   * @param {number} id
   * @param {string} nombre
   * @param {string} [descripcion]
   */
  constructor(id, nombre, descripcion = '') {
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.nombre = nombre;
    /** @type {string} */ this.descripcion = descripcion;
  }
}

// Tabla: palabras  (la dificultad de la BD se modela con herencia)
class Palabra {
  /**
   * @param {number} id
   * @param {Categoria} categoria
   * @param {string} nativa      palabra_lengua_nativa
   * @param {string} espanol     traduccion_espanol
   * @param {string|null} [audioUrl]
   */
  constructor(id, categoria, nativa, espanol, audioUrl = null) {
    /** @type {number} */ this.id = id;
    /** @type {Categoria} */ this.categoria = categoria; // asociación: cada palabra conoce su categoría
    /** @type {string} */ this.nativa = nativa;
    /** @type {string} */ this.espanol = espanol;
    /** @type {string|null} */ this.audioUrl = audioUrl;
  }
  /** @returns {string} */
  dificultad() { return 'facil'; }
  /** @returns {number} */
  intentosParaDominar() { return 3; }
}

class PalabraFacil extends Palabra {}

class PalabraMedia extends Palabra {
  /** @returns {string} */
  dificultad() { return 'medio'; }
  /** @returns {number} */
  intentosParaDominar() { return 5; }
}

class PalabraDificil extends Palabra {
  /** @returns {string} */
  dificultad() { return 'dificil'; }
  /** @returns {number} */
  intentosParaDominar() { return 8; }
}

// Tablas: lecciones + leccion_palabras (relación N:M)
class Leccion {
  /** @type {Palabra[]} */
  #palabras = [];                 // agregación: las palabras existen por sí solas
  /**
   * @param {number} id
   * @param {Categoria} categoria
   * @param {string} titulo
   * @param {number} orden
   */
  constructor(id, categoria, titulo, orden) {
    /** @type {number} */ this.id = id;
    /** @type {Categoria} */ this.categoria = categoria;
    /** @type {string} */ this.titulo = titulo;
    /** @type {number} */ this.orden = orden;
  }
  /** @param {Palabra} palabra @returns {void} */
  agregarPalabra(palabra) { this.#palabras.push(palabra); }
  /** @returns {Palabra[]} */
  get palabras() { return [...this.#palabras]; }
}

// Tabla: progreso
class Progreso {
  /** @param {Palabra} palabra */
  constructor(palabra) {
    /** @type {Palabra} */ this.palabra = palabra;   // asociación: de qué palabra es este progreso
    /** @type {boolean} */ this.dominado = false;
    /** @type {number} */ this.intentos = 0;
    /** @type {Date|null} */ this.fechaUltimaPractica = null;
  }
  /** @returns {Progreso} */
  registrarIntento() {
    this.intentos += 1;
    this.fechaUltimaPractica = new Date();
    this.dominado = this.intentos >= this.palabra.intentosParaDominar(); // polimórfico
    return this;
  }
}

// Tabla: usuarios
class Usuario {
  /** @type {string} */
  #contrasena;                    // se guarda cifrada, nunca en texto plano
  /** @type {Map<number, Progreso>} */
  #progreso = new Map();          // composición: idPalabra -> Progreso
  /**
   * @param {number} id
   * @param {string} nombre
   * @param {string} correo
   * @param {string} contrasena   texto plano; se cifra antes de guardarse
   */
  constructor(id, nombre, correo, contrasena) {
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.nombre = nombre;
    /** @type {string} */ this.correo = correo;
    /** @type {Date} */ this.fechaRegistro = new Date();
    this.#contrasena = Usuario.#cifrar(contrasena);
  }
  /** @param {string} plano @param {string} [sal] @returns {string} */
  static #cifrar(plano, sal = crypto.randomBytes(16).toString('hex')) {
    return `${sal}:${crypto.scryptSync(plano, sal, 32).toString('hex')}`;
  }
  /** @param {string} plano @returns {boolean} */
  verificarContrasena(plano) {
    const [sal] = this.#contrasena.split(':');
    const intento = Usuario.#cifrar(plano, sal);
    return crypto.timingSafeEqual(Buffer.from(intento), Buffer.from(this.#contrasena));
  }
  /** @param {Palabra} palabra @returns {Progreso} */
  practicar(palabra) {
    if (!this.#progreso.has(palabra.id)) {
      this.#progreso.set(palabra.id, new Progreso(palabra)); // el progreso nace con el usuario
    }
    return this.#progreso.get(palabra.id).registrarIntento();
  }
  /** @returns {Palabra[]} */
  palabrasDominadas() {
    return [...this.#progreso.values()].filter(p => p.dominado).map(p => p.palabra);
  }
}

module.exports = {
  Categoria, Palabra, PalabraFacil, PalabraMedia, PalabraDificil,
  Leccion, Progreso, Usuario,
};
