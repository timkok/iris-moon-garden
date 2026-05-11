const CACHE_NAME = "iris-moon-garden-v1";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./save-manager.js",
  "./audio-manager.js",
  "./game.js",
  "./bot.js",
  "./manifest.json",
  "./favicon.svg",
  "./favicon.ico",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/audio/collect_seed.mp3",
  "./assets/audio/collect_heart.mp3",
  "./assets/audio/hurt.mp3",
  "./assets/audio/win.mp3",
  "./assets/audio/door_open.mp3",
  "./assets/audio/bgm.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
