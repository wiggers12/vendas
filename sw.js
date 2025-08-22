self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("gigas-cache").then(cache => {
      return cache.addAll([
        "index.html",
        "manifest.json",
        "IMG_6128.jpeg",
        "IMG_6138.png",
        "IMG_6139.png",
        "IMG_6169.jpeg",
        "IMG_6170.jpeg",
        "IMG_6173.jpeg",
        "IMG_6174.jpeg"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
