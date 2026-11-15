/* ============================================================
   CONFIGURACIÓN DE LA TIENDA — editá acá precios, formatos y pago
   ============================================================ */
const SHOP = {
  currency: 'ARS',
  locale: 'es-AR',
  contactEmail: 'acilbuper@gmail.com',

  // ⚠ PRECIOS PROVISORIOS: reemplazalos por los reales.
  // Se pueden pisar por obra con  prices:{ebook:4900}  en js/books.js
  formats: {
    ebook:      { label: 'Ebook',            short: 'Ebook',    price: 6500,  detail: 'EPUB + PDF para cualquier lector o dispositivo.' },
    navegable:  { label: 'Libro navegable',  short: 'Navegable',price: 8500,  detail: 'Edición web con índice interactivo, para leer en cualquier pantalla.' },
    audiolibro: { label: 'Audiolibro',       short: 'Audio',    price: 12000, detail: 'Narración completa en capítulos, lista para escuchar.' },
    fisico:     { label: 'Edición impresa',  short: 'Impreso',  price: 24000, detail: 'Libro en papel, con envío.' }
  },

  // Estado por defecto de cada formato: 'available' | 'soon' | 'none'
  // (el navegable sólo se ofrece si la obra tiene lectura digital)
  defaultStatus: { ebook: 'available', navegable: 'available', audiolibro: 'soon', fisico: 'soon' },

  // Medios de pago que se le ofrecen al comprador al cerrar el pedido
  paymentMethods: ['Mercado Pago', 'Transferencia bancaria', 'PayPal (exterior)']
};

/* Biografías manuales. Los autores que no figuren acá se muestran
   con una ficha generada a partir de sus obras del catálogo. */
const AUTHOR_BIOS = {
  'Manuel Enrique Landsman': { role: 'Sociólogo · escritor · ensayista', bio: 'Su obra se mueve entre la sociología, la filosofía, la historia y la narrativa. La ficción aparece como una forma de indagación y el ensayo como una herramienta para interrogar el presente.' },
  'Celestina Paz': { role: 'Narrativa · ficción', bio: 'Autora incorporada al catálogo de Anitnegra Acilbuper con obras de narrativa contemporánea y exploración de la experiencia humana.' },
  'Jorge Gómez Lescano': { role: 'Narrativa · literatura', bio: 'Autor incorporado al catálogo de la editorial, con una obra orientada a la narrativa y a la construcción de mundos literarios.' },
  'Manuel Amenhotep': { role: 'Biblioteca Gnóstica · pensamiento espiritual', bio: 'Autor de la serie Biblioteca Gnóstica, dedicada a tradiciones etíopes, textos apócrifos, literatura sacra y relecturas de la tradición gnóstica.' },
  'María Ernestina Lazarte': { role: 'Narrativa · novela histórica', bio: 'Autora incorporada al catálogo de Anitnegra Acilbuper Editores, con obras que exploran la memoria, el territorio y las comunidades de Santiago del Estero.' }
};

const COLLECTIONS = [
  { name: 'Narrativa histórica',     blurb: 'Fundaciones, despojos y fronteras del Tucumán colonial y la Independencia.' },
  { name: 'Narrativa contemporánea', blurb: 'El monte, el agua y los pueblos de hoy.' },
  { name: 'Biblioteca Gnóstica',     blurb: 'Tradiciones etíopes, apócrifos y literatura sacra.' },
  { name: 'Trilogía Mineral',        blurb: 'Materia, tiempo y memoria en tres movimientos.' },
  { name: 'Ensayo y pensamiento',    blurb: 'Sociología, filosofía y cultura para pensar el presente.' }
];
