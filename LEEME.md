# Sitio Anitnegra Acilbuper Editores — guía rápida

Archivos nuevos (van junto a tu carpeta `assets/`, que no se toca):

- `index.html`, `atlas.html` — las dos páginas
- `css/shop.css` — presentación, tienda y carrito
- `js/config.js` — **precios, formatos, medios de pago, bios de autores, colecciones**
- `js/books.js` — **catálogo de obras** (una sola fuente para index y atlas)
- `js/shop.js` — fichas de obra, carrito y pedido

## Agregar una obra
Copiá un bloque de `js/books.js` y cambiá `id`, `title`, `short`, `author`, `collection`, `type`, `year`,
`cover` (ej. `assets/mi-libro.png`; si no hay portada se genera una tipográfica), `description`, `quote`, `readLink`, `amazonLink`.
Con `readLink` la obra ofrece formato **navegable**. Para quitar el cartel "ficha en preparación" borrá `"draft":true`.

## Precios y formatos
En `js/config.js`: `SHOP.formats` (precio base por formato) y `SHOP.defaultStatus` (`available` / `soon` / `none`).
Por obra se puede pisar: `"prices":{"ebook":4900}` o `"formats":{"audiolibro":"available"}`.
**Los precios actuales son provisorios.**

## Cómo funciona el pedido
El carrito se guarda en el navegador. Al "Enviar pedido" se registra con Netlify Forms (formulario `pedido`,
aparece en Forms del panel de Netlify, con el detalle y el total). No cobra: respondés con el link o datos de pago
y enviás los archivos. Si el envío falla, ofrece un correo prellenado a acilbuper@gmail.com.
"Avisarme" (audiolibro/impreso) llega al formulario `aviso-formato`.
