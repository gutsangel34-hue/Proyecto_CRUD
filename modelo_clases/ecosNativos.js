// ecosNativos.js — Ecos Nativos: la clase que coordina toda la app
// Los tipos de dato se documentan con JSDoc y coinciden con el diagrama UML.

/** @typedef {import('./modelo').Categoria} Categoria */
/** @typedef {import('./modelo').Palabra} Palabra */
/** @typedef {import('./modelo').Leccion} Leccion */
/** @typedef {import('./modelo').Usuario} Usuario */
/** @typedef {import('./modelo').Progreso} Progreso */

class EcosNativos {
  /** @type {Map<number, Categoria>} */ #categorias = new Map();
  /** @type {Map<number, Palabra>} */ #palabras = new Map();
  /** @type {Map<number, Leccion>} */ #lecciones = new Map();
  /** @type {Map<number, Usuario>} */ #usuarios = new Map();

  /** @param {Categoria} categoria @returns {void} */
  agregarCategoria(categoria) { this.#categorias.set(categoria.id, categoria); }

  /** @param {Palabra} palabra @returns {void} */
  agregarPalabra(palabra) { this.#palabras.set(palabra.id, palabra); }

  /** @param {Leccion} leccion @returns {void} */
  agregarLeccion(leccion) { this.#lecciones.set(leccion.id, leccion); }

  /** @param {Usuario} usuario @returns {Usuario} */
  registrarUsuario(usuario) {
    const existe = [...this.#usuarios.values()].some(u => u.correo === usuario.correo);
    if (existe) throw new Error('Correo ya registrado');
    this.#usuarios.set(usuario.id, usuario);
    return usuario;
  }

  /** @param {string} correo @param {string} contrasena @returns {Usuario} */
  iniciarSesion(correo, contrasena) {
    const usuario = [...this.#usuarios.values()].find(u => u.correo === correo);
    if (!usuario?.verificarContrasena(contrasena)) {
      throw new Error('Credenciales inválidas');
    }
    return usuario;
  }

  /** @param {number} idUsuario @param {number} idPalabra @returns {Progreso} */
  practicar(idUsuario, idPalabra) {
    const usuario = this.#usuarios.get(idUsuario);
    const palabra = this.#palabras.get(idPalabra);
    if (!usuario || !palabra) throw new Error('Usuario o palabra no existe');
    return usuario.practicar(palabra);
  }
}

module.exports = { EcosNativos };
