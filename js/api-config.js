(function () {
  const host = window.location.hostname;
  const port = window.location.port;

  // Archivo local sin servidor
  if (window.location.protocol === "file:") {
    window.API_URL = "http://localhost:3000";
    return;
  }

  // Vercel o servidor local en puerto 3000: misma URL (/api/...)
  if (host.endsWith(".vercel.app") || ((host === "localhost" || host === "127.0.0.1") && port === "3000")) {
    window.API_URL = "";
    return;
  }

  // Dominio propio en producción (ej. tu-juego.com)
  if (host !== "localhost" && host !== "127.0.0.1") {
    window.API_URL = "";
    return;
  }

  // Live Server u otro puerto en local
  window.API_URL = "http://localhost:3000";
})();
