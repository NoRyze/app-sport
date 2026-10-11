// Transforme la version web (dossier dist/) en "web app" installable sur
// l'écran d'accueil de l'iPhone, qui fonctionne hors ligne.
//
// Utilisation : npm run build:web
//
// Ce script :
// 1. ajoute dans index.html les balises pour l'iPhone (icône, plein écran)
// 2. crée manifest.webmanifest (nom, icône, couleurs de l'app)
// 3. crée sw.js, le "service worker" : il garde une copie de l'app sur le
//    téléphone pour qu'elle s'ouvre sans internet, et télécharge en arrière-plan
//    les images des exercices.
// 4. copie index.html en 404.html (nécessaire pour GitHub Pages).

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const racine = path.join(__dirname, '..');
const dist = path.join(racine, 'dist');
const appJson = JSON.parse(fs.readFileSync(path.join(racine, 'app.json'), 'utf8')).expo;
// Si l'app est publiée dans un sous-dossier (ex : https://moi.github.io/app-sport/)
const base = `${(appJson.experiments?.baseUrl ?? '').replace(/\/$/, '')}/`;

// --- Liste de tous les fichiers de l'app ---
function lister(dossier) {
  return fs.readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    const chemin = path.join(dossier, e.name);
    return e.isDirectory() ? lister(chemin) : [chemin];
  });
}
const fichiers = lister(dist)
  .map((f) => path.relative(dist, f).split(path.sep).join('/'))
  .filter((f) => !['sw.js', '404.html', 'metadata.json'].includes(f));

// --- Images des exercices (lues dans src/lib/exercices.ts) ---
const exercices = fs.readFileSync(path.join(racine, 'src/lib/exercices.ts'), 'utf8');
const imageBase = exercices.match(/IMG_BASE = '([^']+)'/)[1];
const ids = [...new Set([...exercices.matchAll(/image: '([^']+)'/g)].map((m) => m[1]))];
const images = ids.flatMap((id) => [`${imageBase}/${id}/0.jpg`, `${imageBase}/${id}/1.jpg`]);

// --- 1. index.html ---
const indexPath = path.join(dist, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes('manifest.webmanifest')) {
  html = html
    .replace('<html lang="en">', '<html lang="fr">')
    .replace(
      '</head>',
      [
        `<link rel="manifest" href="${base}manifest.webmanifest" />`,
        `<link rel="apple-touch-icon" href="${base}icons/icon-180.png" />`,
        '<meta name="theme-color" content="#0E0F12" />',
        '<meta name="apple-mobile-web-app-capable" content="yes" />',
        '<meta name="mobile-web-app-capable" content="yes" />',
        '<meta name="apple-mobile-web-app-status-bar-style" content="black" />',
        `<meta name="apple-mobile-web-app-title" content="${appJson.name}" />`,
        '<style>body{background:#0E0F12}</style>',
        '</head>',
      ].join('\n    '),
    )
    .replace(
      '</body>',
      `<script>if('serviceWorker' in navigator){addEventListener('load',function(){navigator.serviceWorker.register('${base}sw.js',{scope:'${base}'})})}</script>\n</body>`,
    );
  fs.writeFileSync(indexPath, html);
}

// --- 2. manifest ---
fs.writeFileSync(
  path.join(dist, 'manifest.webmanifest'),
  JSON.stringify(
    {
      name: appJson.name,
      short_name: appJson.name,
      lang: 'fr',
      start_url: base,
      scope: base,
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#0E0F12',
      theme_color: '#0E0F12',
      icons: [
        { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    null,
    2,
  ),
);
if (!fichiers.includes('manifest.webmanifest')) fichiers.push('manifest.webmanifest');

// --- 3. service worker ---
// La version change dès qu'un fichier change : le téléphone récupère alors la mise à jour.
const empreinte = crypto.createHash('sha1');
for (const f of fichiers) empreinte.update(f).update(fs.readFileSync(path.join(dist, f)));
const version = empreinte.digest('hex').slice(0, 10);
// index.html est mis en cache sous l'adresse de base (certains hébergeurs
// redirigent /index.html vers /, ce qui casserait l'ouverture hors ligne).
const precache = [base, ...fichiers.filter((f) => f !== 'index.html').map((f) => base + f)];

const sw = `// Généré par scripts/build-pwa.js — ne pas modifier à la main.
const VERSION = ${JSON.stringify(version)};
const APP_CACHE = 'app-' + VERSION;
const IMG_CACHE = 'images-exercices';
const BASE = ${JSON.stringify(base)};
const PRECACHE = ${JSON.stringify(precache)};
const IMAGES = ${JSON.stringify(images)};

// Installation : on copie toute l'app sur le téléphone.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

// Activation : on supprime les anciennes versions, puis on télécharge
// les images des exercices en arrière-plan (sans bloquer l'app).
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((c) => c.startsWith('app-') && c !== APP_CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
  telechargerImages();
});

async function telechargerImages() {
  const cache = await caches.open(IMG_CACHE);
  const restantes = [...IMAGES];
  const travail = async () => {
    while (restantes.length) {
      const url = restantes.shift();
      try {
        if (!(await cache.match(url))) {
          const reponse = await fetch(url);
          if (reponse.ok) await cache.put(url, reponse);
        }
      } catch (e) {
        // pas de réseau : on réessaiera au prochain lancement
      }
    }
  };
  await Promise.all([travail(), travail(), travail(), travail()]);
}

// Chaque demande : d'abord la copie sur le téléphone, sinon internet.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Ouverture d'une page de l'app (ex : /seance/1/2) : on sert toujours index.html.
  if (req.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(caches.match(BASE).then((r) => r || fetch(req)));
    return;
  }

  if (IMAGES.includes(req.url)) {
    event.respondWith(
      caches.open(IMG_CACHE).then((cache) =>
        cache.match(req.url).then(
          (r) =>
            r ||
            fetch(req.url).then((reponse) => {
              if (reponse.ok) cache.put(req.url, reponse.clone());
              return reponse;
            }),
        ),
      ),
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(req).then((r) => r || fetch(req)));
  }
});
`;
fs.writeFileSync(path.join(dist, 'sw.js'), sw);

// --- 4. 404.html pour GitHub Pages ---
fs.copyFileSync(indexPath, path.join(dist, '404.html'));

console.log(`Web app prête dans dist/ (version ${version}, ${precache.length} fichiers, ${images.length} images d'exercices).`);
