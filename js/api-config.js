(function () {
  // Misma BD Atlas para todos. Si abres el juego en otro PC (Live Server, etc.) usa la API de Vercel.
  var API_NUBE = "https://five-nights-at-atlantida.vercel.app";

  var host = window.location.hostname;
  var port = window.location.port;
  var protocol = window.location.protocol;

  // En Vercel o tu dominio: API en el mismo sitio
  if (host.endsWith(".vercel.app")) {
    window.API_URL = "";
    return;
  }

  // npm run dev → http://localhost:3000 (misma BD si tienes .env)
  if ((host === "localhost" || host === "127.0.0.1") && port === "3000") {
    window.API_URL = "";
    return;
  }

  // Dominio propio en producción
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    window.API_URL = "";
    return;
  }

  // file://, Live Server u otro puerto local → ranking en la nube (todos ven lo mismo)
  window.API_URL = API_NUBE.replace(/\/$/, "");
})();
