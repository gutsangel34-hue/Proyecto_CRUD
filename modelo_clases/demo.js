// demo.js — prueba rápida con los mismos datos de la base de datos
const {
  Categoria, PalabraFacil, PalabraMedia, PalabraDificil, Leccion, Usuario,
} = require('./modelo');
const { EcosNativos } = require('./ecosNativos');

const app = new EcosNativos();

const saludos = new Categoria(1, 'Saludos', 'Expresiones para saludar en lengua kankuama');
const naturaleza = new Categoria(3, 'Naturaleza', 'Elementos de la Sierra Nevada');
[saludos, naturaleza].forEach(c => app.agregarCategoria(c));

const buenosDias = new PalabraFacil(1, saludos, 'Zuminyänu', 'Buenos días');
const palma = new PalabraDificil(6, naturaleza, 'Chingale', 'Palma');
const algodon = new PalabraMedia(9, naturaleza, 'Biata', 'Algodón');
[buenosDias, palma, algodon].forEach(p => app.agregarPalabra(p));

const leccion = new Leccion(3, naturaleza, 'Nuestra tierra', 3);
leccion.agregarPalabra(palma);
leccion.agregarPalabra(algodon);
app.agregarLeccion(leccion);
console.log('Lección:', leccion.titulo, '→', leccion.palabras.map(p => p.nativa).join(', '));

app.registrarUsuario(new Usuario(1, 'Angel Gutierrez', 'angel@example.com', 'angel123'));
const sesion = app.iniciarSesion('angel@example.com', 'angel123');
console.log('Sesión iniciada:', sesion.nombre);

// Polimorfismo: cada tipo de palabra exige distintos intentos para dominarse
for (const palabra of [buenosDias, algodon, palma]) {
  let progreso;
  for (let i = 0; i < palabra.intentosParaDominar(); i++) {
    progreso = app.practicar(1, palabra.id);
  }
  console.log(
    `${palabra.nativa} (${palabra.dificultad()}): ${progreso.intentos} intentos, dominada = ${progreso.dominado}`
  );
}
console.log('Dominadas:', sesion.palabrasDominadas().map(p => p.nativa).join(', '));

try { app.iniciarSesion('angel@example.com', 'mala'); }
catch (e) { console.log('Contraseña incorrecta →', e.message); }
try { app.registrarUsuario(new Usuario(2, 'Otro', 'angel@example.com', 'x')); }
catch (e) { console.log('Correo repetido →', e.message); }
