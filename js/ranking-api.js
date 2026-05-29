(function () {
  const base = (window.API_URL || "").replace(/\/$/, "");

  function leerJson(respuesta) {
    const tipo = respuesta.headers.get("content-type") || "";
    if (!tipo.includes("application/json")) {
      return respuesta.text().then(() => {
        throw new Error("La API del ranking no responde. ¿Está desplegada en Vercel o node server.js en marcha?");
      });
    }
    return respuesta.json();
  }

  window.RankingApi = {
    top10(noche) {
      const url = base + "/api/partidas?noche=" + noche + "&limit=10";
      return fetch(url).then((r) =>
        leerJson(r).then((data) => {
          if (!r.ok) throw new Error((data && data.error) || "HTTP " + r.status);
          return data;
        })
      );
    },

    guardar(usuario, noche, puntuacion) {
      return fetch(base + "/api/partidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, noche, puntuacion })
      }).then((r) =>
        leerJson(r).then((data) => {
          if (!r.ok) throw new Error((data && data.error) || "HTTP " + r.status);
        })
      );
    }
  };
})();
