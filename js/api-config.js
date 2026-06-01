(function () {
  const host = window.location.hostname;
  const port = window.location.port;
  const LOCAL_API = "http://localhost:3000";

  // file:// o Live Server (5500, etc.): el juego en un sitio, la API en :3000
  if (window.location.protocol === "file:") {
    window.API_URL = LOCAL_API;
    return;
  }

  // Vercel, dominio propio, o npm run dev (todo en :3000): /api relativo
  if (
    host.endsWith(".vercel.app") ||
    ((host === "localhost" || host === "127.0.0.1") && port === "3000")
  ) {
    window.API_URL = "";
    return;
  }

  if (host !== "localhost" && host !== "127.0.0.1") {
    window.API_URL = "";
    return;
  }

  window.API_URL = LOCAL_API;
})();
