/*
 * service-worker.js — PWA
 * =======================
 * Strategie "reseau d'abord" pour toute l'interface (HTML/CSS/JS/images) :
 * on sert toujours la derniere version quand il y a du reseau, et on tombe sur
 * le cache uniquement hors-ligne. Ca evite tout melange incoherent entre un
 * nouveau HTML et d'anciens scripts en cache (cause de bugs apres mise a jour).
 *
 * Les fichiers AUDIO ne sont PAS interceptes : le navigateur gere le streaming
 * et les requetes partielles (Range), indispensable a la lecture / au seek sur
 * iPhone. L'album n'est donc jamais telecharge entierement en arriere-plan.
 */

var CACHE = "semi-v6";

var APP_SHELL = [
  "./",
  "./index.html",
  "./css/styles.css?v=6",
  "./js/album-data.js?v=6",
  "./js/player.js?v=6",
  "./js/app.js?v=6",
  "./manifest.webmanifest",
  "./assets/cover-1200.jpg",
  "./assets/cover-512.jpg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/scenes/scene-wall.jpg",
  "./assets/scenes/scene-lighter.jpg",
  "./assets/scenes/scene-gun.jpg",
  "./assets/scenes/scene-couple.jpg",
  "./assets/scenes/scene-booking.jpg",
  "./assets/scenes/scene-pill.jpg",
  "./assets/scenes/scene-morgue.jpg",
  "./assets/waveforms/01-half-dead.json",
  "./assets/waveforms/02-living-proof-live.json",
  "./assets/waveforms/03-backlash.json",
  "./assets/waveforms/04-la-semi.json",
  "./assets/waveforms/05-fast-feat-trace.json",
  "./assets/waveforms/06-living-proof.json",
  "./assets/waveforms/07-dance-around.json",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) {
          if (k !== CACHE) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

function isAudio(request, url) {
  return (
    request.destination === "audio" ||
    /\.(mp3|m4a|aac|ogg|wav|flac)(\?|$)/i.test(url.pathname)
  );
}

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // AUDIO : laisser le navigateur gerer (streaming + Range).
  if (isAudio(request, url)) return;

  // Tout le reste : reseau d'abord, cache en repli (hors-ligne).
  event.respondWith(
    fetch(request)
      .then(function (response) {
        if (response && response.status === 200 && response.type === "basic") {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(request).then(function (cached) {
          return cached || caches.match("./index.html");
        });
      })
  );
});
