# Bar Pelayo — Landing cinematográfica (maqueta v3)

> **Maqueta interna no oficial para presentar al Bar Pelayo. No está publicada.** El formulario prepara un correo en el cliente de email del visitante mediante `mailto:`; no envía solicitudes automáticamente. WhatsApp permanece oculto mientras `CONFIG.whatsapp` esté vacío. Antes de publicar, el bar debe validar los contenidos, precios, condiciones y derechos de imagen.

## Estructura

```text
pelayo-landing-v3/
├── index.html
├── styles.css
├── script.js
├── i18n.js
├── carta.json
└── README.md
```

Las fotografías no están incluidas en el ZIP. Coloca la carpeta `img/` junto a `index.html`, manteniendo exactamente estos nombres y rutas:

```text
img/barra-botellero-lampara.jpg
img/barra-jamones.jpg
img/bodega-pared-vinos.jpg
img/calle-placentines-giralda.jpg
img/fachada-terraza-placentines.jpg
img/hero-terraza-placentines.jpg
img/jardin-vertical-cocina.jpg
img/jardin-vertical-ventana-cocina.jpg
img/plato-anchoas-tosta.jpg
img/plato-camembert-membrillo.jpg
img/plato-carne-patatas.jpg
img/plato-carrillera-espuma-patata-setas.jpg
img/plato-guiso-patatas.jpg
img/plato-pescado-verduras.jpg
img/plato-pulpo-asado.jpg
img/plato-tartar.jpg
img/salon-bodega-taurina.jpg
img/salon-bodega-tio-pepe-jardin.jpg
img/salon-grande-grupos.jpg
img/salon-grande-mesa-larga.jpg
img/salon-vanguardia-nueva-york.jpg
img/salon-vanguardia-retratos.jpg
img/terraza-mesa-pareja.jpg
```

No se deben renombrar las imágenes ni cambiar sus rutas `img/...` en el HTML. Para sustituir una fotografía, conserva el nombre del archivo y reemplaza el fichero dentro de `img/`. Así no hay que modificar el código. Para incorporar una fotografía nueva, primero confirma su procedencia y autorización, añade el archivo a `img/` y actualiza la ruta en `index.html`.

## Cómo verla en local

La carta se carga mediante `fetch('carta.json')`, por lo que debes servir la carpeta desde un servidor local:

```bash
cd pelayo-landing-v3
python3 -m http.server 8766
```

Abre `http://localhost:8766`. Para probar otro idioma, utiliza `?lang=en`, `?lang=it`, `?lang=fr` o `?lang=de`. El idioma también se conserva en `localStorage`.

## Archivos y edición

| Archivo | Función |
|---|---|
| `index.html` | Estructura, contenido, fotografías, metadatos SEO y datos estructurados `Restaurant` de schema.org. |
| `styles.css` | Identidad visual, diseño responsive, estados accesibles, transiciones y adaptación a movimiento reducido. |
| `script.js` | Idiomas, carta, bodega, reserva, WhatsApp opcional, menú móvil, galería, Lenis, GSAP y ScrollTrigger. |
| `i18n.js` | Textos de interfaz completos en español, inglés, italiano, francés y alemán (`window.I18N`). |
| `carta.json` | Categorías, platos, precios, descripciones y vinos. |
| `README.md` | Instrucciones de edición y puntos pendientes de validar. |

### Editar platos y precios

Abre `carta.json`. Cada plato está dentro del array `dishes` y utiliza esta estructura orientativa:

```json
{
  "num": 8,
  "name": "Nombre del plato",
  "category": "tapas",
  "prices": {
    "tapa": 5.00,
    "media": 10.00,
    "plato": 15.00
  },
  "vegetarian": false,
  "allergens": null,
  "desc": {
    "en": "English description",
    "it": "Descrizione in italiano",
    "fr": "Description en français",
    "de": "Beschreibung auf Deutsch"
  }
}
```

- `name`: nombre que se muestra en la carta. Se mantiene en español.
- `category`: debe coincidir con un `id` existente en `categories`: `ensaladas`, `frias`, `tapas`, `especialidades`, `pescado`, `sugerencias`, `huevos`, `carne`, `chacinas`, `postres`, `bebidas` o `vinos`.
- `prices`: importes numéricos en euros. Usa punto decimal; utiliza `null` si un formato no existe. La web muestra `—` para esos casos.
- `vegetarian`: `true` añade la etiqueta vegetariana orientativa y permite que el plato aparezca al activar el filtro.
- `desc`: descripciones opcionales por idioma. Si una traducción no existe, no se muestra descripción en ese idioma.
- `num`: número de referencia de la carta publicada.
- `priceLabels` (opcional): permite cambiar la etiqueta de cada columna. Por ejemplo, `{"tapa":"Copa","plato":"Botella"}`. `Copa`, `Jarra` y `Botella` tienen traducción; otros valores se muestran literalmente.

Los vinos están en el array `wines`. Cada referencia utiliza `name`, `region`, `grape`, `type`, `glass` y `bottle`. Los tipos admitidos por los filtros son `Tintos`, `Blancos`, `Generosos` y `Cava y champagne`.

Después de editar, valida el JSON:

```bash
python3 -m json.tool carta.json > /dev/null && echo "JSON válido"
```

### Editar textos y traducciones

En `index.html`:
- `data-i18n="clave"` inserta texto plano.
- `data-i18n-html="clave"` inserta contenido con etiquetas HTML sencillas como `<br>`, `<em>` o `<strong>`.
- `data-i18n-attr="atributo:clave"` traduce atributos como `alt`, `aria-label`, `title` y `placeholder`.

Los textos se mantienen en `i18n.js`. Si se añade una clave nueva, debe añadirse en los cinco idiomas (`es`, `en`, `it`, `fr`, `de`) para no dejar traducciones incompletas.

### Cambiar fotos

1. Guarda la fotografía autorizada dentro de `img/`.
2. Conserva el nombre de archivo esperado o cambia la ruta correspondiente en `index.html`.
3. Actualiza el texto alternativo `alt` y su traducción en `i18n.js` si cambia el contenido de la imagen.
4. Mantén `loading="lazy"` y `decoding="async"` en imágenes secundarias. La imagen principal del hero se carga con prioridad alta y no utiliza lazy loading.
5. No uses fotografías de otros locales, bancos de imágenes o redes sociales para sustituir las fotografías originales.

### Animación, rendimiento y accesibilidad

- GSAP 3.12.5 y ScrollTrigger se cargan desde cdnjs; Lenis 1.1.20 se carga desde jsDelivr.
- Si GSAP o ScrollTrigger no cargan, el contenido permanece visible y se conserva el scroll nativo. Si Lenis falla, ScrollTrigger puede seguir funcionando con el scroll del navegador.
- En escritorio, la historia utiliza una escena fija con dos capítulos y los tres espacios forman un recorrido horizontal fijado al scroll vertical.
- En móvil/tablet se eliminan los pins pesados y se muestran los espacios en vertical.
- `prefers-reduced-motion: reduce` desactiva GSAP, Lenis, el cursor y las transiciones animadas.
- El cursor personalizado solo aparece con puntero fino en escritorio.
- Las imágenes secundarias usan carga diferida. Las cajas visuales reservan dimensiones para reducir saltos de layout.

## Configuración de WhatsApp

En la parte superior de `script.js`:

```js
const CONFIG = {
  whatsapp: '',
  email: 'info@pelayobar.com',
  defaultLang: 'es'
};
```

`whatsapp` debe permanecer vacío hasta que el bar confirme el número oficial. Cuando lo confirme, introduce el número internacional con dígitos únicamente, incluido el prefijo de país (por ejemplo, `34XXXXXXXXX`). Entonces aparecerán el botón de WhatsApp del formulario y el enlace de contacto. No se ha inventado ni añadido ningún número.

## Pendiente de verificar con el bar

- **WhatsApp:** confirmar el número oficial antes de activar el botón.
- **Carta y precios:** confirmar que los platos, formatos y precios publicados siguen vigentes.
- **Alérgenos:** validar la información con el establecimiento e integrar, si procede, la tabla oficial numerada y su leyenda.
- **Etiquetas vegetarianas:** confirmar con cocina las clasificaciones, actualmente orientativas.
- **Bodega:** confirmar referencias, tipos, añadas, disponibilidad y precios por copa o botella.
- **Reservas de grupos:** confirmar las condiciones de pago para grupos de 10 o más personas, incluida señal, importe y plazos.
- **Salón grande:** confirmar que las fotografías asignadas a la sección de grupos corresponden a la sala que el bar ofrece para celebraciones.
- **Menús de grupo:** confirmar que los seis menús de 40 a 65 €/persona del PDF oficial `Menus-Pelayo-2026.pdf` siguen vigentes y que los importes incluyen IVA.
- **Valoración externa:** confirmar que la puntuación 8,8/10 atribuida a TheFork continúa actualizada.
- **Traducciones:** revisar con el bar los nombres y descripciones de platos y vinos en los cinco idiomas, especialmente las traducciones propias de bebidas y vinos de la casa.
- **Fotografías:** solicitar autorización expresa para publicar las imágenes y, si es posible, los originales en alta resolución. El hero disponible en la maqueta tiene 1024 px de ancho.
- **Aseos:** solicitar una fotografía autorizada de los aseos con fotografías de uvas si se quiere sustituir el espacio actualmente señalado como foto pendiente.

## Procedencia y derechos de las fotografías

Las 23 fotografías utilizadas en la maqueta proceden de la web oficial de Bar Pelayo (`https://www.pelayobar.com`, portada y galería). No se han añadido fotografías de otros establecimientos ni imágenes nuevas. Los archivos y sus derechos corresponden a Bar Pelayo y/o a sus fotógrafos. El uso actual es exclusivamente para esta maqueta interna; no publicar sin autorización.
