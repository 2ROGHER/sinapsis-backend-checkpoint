/**
 * Genera `docs/swagger-ui.html`: Swagger UI AUTOCONTENIDO a partir de `docs/openapi.yaml`.
 *
 * Swagger UI no trae un comando que produzca HTML estático (solo entrega assets), así
 * que este script hace ese ensamblado: incrusta en un único archivo el contrato, el
 * CSS y el bundle JS de `swagger-ui-dist`. El resultado se abre con doble clic, sin
 * servidor ni CDN (mismo flujo que `docs/openapi-preview.html` de Redoc).
 *
 * - Herramienta de documentación: vive fuera de `src/`, no se empaqueta en la Lambda.
 * - Sin dependencias propias: solo módulos nativos de Node + `swagger-ui-dist` (dev).
 * - El YAML se incrusta tal cual y Swagger UI lo parsea en el navegador, así que no se
 *   necesita un parser YAML aquí.
 *
 * Uso: npm run docs:swagger
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SPEC_FILE = path.join(ROOT, 'docs', 'openapi.yaml');
const OUT_FILE = path.join(ROOT, 'docs', 'swagger-ui.html');

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function readAsset(dir, name) {
  const file = path.join(dir, name);
  if (!fs.existsSync(file)) fail(`No existe ${file}`);
  return fs.readFileSync(file, 'utf8');
}

let assetsDir;
try {
  assetsDir = path.dirname(require.resolve('swagger-ui-dist/package.json', { paths: [ROOT] }));
} catch {
  fail('Falta la devDependency swagger-ui-dist. Ejecuta `npm install`.');
}
const version = JSON.parse(readAsset(assetsDir, 'package.json')).version;

if (!fs.existsSync(SPEC_FILE)) fail(`No existe ${SPEC_FILE}`);
const spec = fs.readFileSync(SPEC_FILE, 'utf8');
const specTitle = (spec.match(/^\s{2}title:\s*(.+)$/m) || [, 'API'])[1].trim();

// --- Incrustación segura dentro de <script>/<style> --------------------------------
// Un `</script` literal dentro del contenido cerraría la etiqueta antes de tiempo.
// `<\/script` es equivalente en JS (en strings y regex) y no cierra el elemento.
const escapeScript = (js) => js.replace(/<\/(script)/gi, '<\\/$1');
const escapeStyle = (css) => css.replace(/<\/(style)/gi, '<\\/$1');
// Se quitan los comentarios `sourceMappingURL`: apuntarían a .map inexistentes.
const stripSourceMap = (code) => code.replace(/\/[*/]#\s*sourceMappingURL=.*$/gm, '');

const css = escapeStyle(stripSourceMap(readAsset(assetsDir, 'swagger-ui.css')));
const js = escapeScript(stripSourceMap(readAsset(assetsDir, 'swagger-ui-bundle.js')));
// El contrato va como string JSON; `<` se escapa para que nunca cierre el <script>.
const specLiteral = JSON.stringify(spec).replace(/</g, '\\u003c');
const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(specTitle)} — Swagger UI</title>
    <!--
      ARCHIVO GENERADO por \`npm run docs:swagger\` (scripts/build-swagger-ui.cjs).
      NO editar a mano: regenerar tras cambiar docs/openapi.yaml.
      Swagger UI ${version} + contrato incrustados: se abre con doble clic, sin servidor ni CDN.
      Para "Try it out" levanta la API con \`npm run dev\` (servidor "Local" del contrato).
    -->
    <style>${css}</style>
    <style>
      body {
        margin: 0;
      }
      /* Oculta el enlace "blob:..." que Swagger UI muestra bajo el título (URL interna del contrato). */
      .swagger-ui .info hgroup.main a.link {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>

    <script>${js}</script>
    <script>
      window.addEventListener('load', function () {
        // El YAML viaja incrustado; se expone como blob: para que Swagger UI lo cargue y
        // lo parsee como lo haría desde una URL (sin fetch a file://, que el navegador bloquea).
        var specText = ${specLiteral};
        var specUrl = URL.createObjectURL(new Blob([specText], { type: 'application/yaml' }));
        window.ui = SwaggerUIBundle({
          url: specUrl,
          dom_id: '#swagger-ui',
          deepLinking: true,
          displayRequestDuration: true,
          tryItOutEnabled: true,
          docExpansion: 'list',
          defaultModelsExpandDepth: 1,
        });
      });
    </script>
  </body>
</html>
`;

fs.writeFileSync(OUT_FILE, html, 'utf8');
const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(0);
console.log(`✔ docs/swagger-ui.html generado (${kb} KB) — Swagger UI ${version}`);
