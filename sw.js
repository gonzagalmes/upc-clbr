/* UPC CLBR · service worker: la página siempre se pide primero a internet (así la versión nueva llega al toque);
   si no hay señal, se abre la última guardada. Los íconos se guardan. Los datos NO se guardan acá (van al Apps Script). */
// 🔔 notificaciones (Firebase Cloud Messaging): con la app cerrada, el celular muestra el aviso solo
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js', 'firebase-config.js');
try { firebase.initializeApp(self.UPC_FIREBASE); firebase.messaging(); } catch (e) {}
self.addEventListener('notificationclick', e => { if (e.notification.data && e.notification.data.FCM_MSG) return; e.notification.close(); e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(L => { const w = L.find(c => c.url.startsWith(self.registration.scope)); return w ? w.focus() : self.clients.openWindow(self.registration.scope); })); });
const CACHE = 'upc-clbr-v13';
const BASE = ['./', 'index.html', 'pwa.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png', 'firebase-config.js', 'aislamientos.html'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // API de Google, fuentes y librerías: directo
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
