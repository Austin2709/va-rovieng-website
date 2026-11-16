const CACHE_NAME = "va-rovieng-v90";
const APP_SHELL = [
  "./",
  "./index.html",
  "./presentations.html",
  "./styles.css",
  "./script.js",
  "./vendor/bootstrap-5.3.9/bootstrap.min.css",
  "./vendor/bootstrap-5.3.9/bootstrap.bundle.min.js",
  "./vendor/bootstrap-5.3.9/LICENSE",
  "./manifest.webmanifest",
  "./images/va-rovieng-logo-cropped.png",
  "./images/project-area-map.jpg",
  "./images/drilling-activities-01.png",
  "./images/drilling-activities-02.png",
  "./images/raw-material-from-machinery-drilling-01.png",
  "./images/raw-material-from-machinery-drilling-02.png",
  "./images/raw-material-from-machinery-drilling-03.png",
  "./images/raw-material-from-machinery-drilling-04.png",
  "./images/raw-material-from-machinery-drilling-05.png",
  "./images/raw-material-from-machinery-drilling-06.png",
  "./images/raw-materials-01.png",
  "./images/raw-materials-02.png",
  "./images/raw-materials-03.png",
  "./images/raw-materials-04.png",
  "./images/raw-materials-05.png",
  "./images/hero-processing-equipment.png",
  "./images/hero-drill-core-samples.png",
  "./images/hero-mineral-sample.png",
  "./images/machinery-01.png",
  "./images/machinery-02.png",
  "./images/machinery-03.png",
  "./images/machinery-04.png",
  "./images/machinery-05.png",
  "./images/machinery-06.png",
  "./images/machinery-07.png",
  "./images/machinery-08.png",
  "./images/machinery-09.png",
  "./images/machinery-10.png",
  "./images/copper-sample.jpg",
  "./images/gold-sample.jpg",
  "./images/certificate-of-incorporation.png",
  "./images/patent-tax-2026.png",
  "./images/patent-tax-certificate.png",
  "./images/vat-registration-certificate.png",
  "./images/va-rovieng-favicon-48.png",
  "./images/va-rovieng-icon-180.png",
  "./images/va-rovieng-icon-192.png",
  "./images/va-rovieng-icon-512.png",
];
const APP_SHELL_PATHS = new Set(
  APP_SHELL.map((path) => new URL(path, self.location.href).pathname),
);

self.addEventListener("install", (event) => {
  const appShellRequests = APP_SHELL.map(
    (path) => new Request(new URL(path, self.location.href), { cache: "reload" }),
  );

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(appShellRequests))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith("va-rovieng-") && cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  const networkResponse = fetch(event.request);
  const cacheUpdate = networkResponse.then(
    (response) => {
      if (
        response.ok &&
        response.type === "basic" &&
        APP_SHELL_PATHS.has(requestUrl.pathname)
      ) {
        return caches
          .open(CACHE_NAME)
          .then((cache) =>
            cache.put(new Request(event.request.url), response.clone()),
          );
      }
    },
    () => undefined,
  );
  event.waitUntil(
    cacheUpdate.catch((error) => {
      console.error("Service worker cache update failed:", error);
    }),
  );

  event.respondWith(
    networkResponse.catch((error) =>
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        throw error;
      }),
    ),
  );
});
