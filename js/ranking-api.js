(function () {
  const base = (window.API_URL || "").replace(/\/$/, "");

  function leerJson(respuesta) {
    const tipo = respuesta.headers.get("content-type") || "";
    if (!tipo.includes("application/json")) {
      return respuesta.text().then(() => {
        throw new Error("No se pudo conectar con el ranking.");
      });
    }
    return respuesta.json();
  }

  /** noche: 1, 2, "1D", "2D" */
  window.RankingApi = {
    top10(noche) {
      const id = encodeURIComponent(String(noche).toUpperCase());
      const url = base + "/api/partidas?noche=" + id + "&limit=10";
      return fetch(url).then((r) =>
        leerJson(r).then((data) => {
          if (!r.ok) throw new Error((data && data.error) || "HTTP " + r.status);
          return data;
        })
      );
    },

    guardar(usuario, noche, puntuacion) {
      const id = String(noche).toUpperCase();
      return fetch(base + "/api/partidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, noche: id, puntuacion })
      }).then((r) =>
        leerJson(r).then((data) => {
          if (!r.ok) throw new Error((data && data.error) || "HTTP " + r.status);
        })
      );
    }
  };
})();
