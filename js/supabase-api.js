(function () {
  const cfg = window.SUPABASE;

  const cabeceras = () => ({
    apikey: cfg.key,
    Authorization: "Bearer " + cfg.key
  });

  window.SupabaseRank = {
    /** Top 10 de una noche */
    top10(noche) {
      const url = cfg.url + "/rest/v1/partidas?noche=eq." + noche +
        "&select=usuario,puntuacion&order=puntuacion.desc&limit=10";
      return fetch(url, { headers: cabeceras() }).then((r) =>
        r.json().then((data) => {
          if (!r.ok) throw new Error((data && data.message) || ("HTTP " + r.status));
          return data;
        })
      );
    },

    /** Guarda una partida nueva */
    guardar(usuario, noche, puntuacion) {
      return fetch(cfg.url + "/rest/v1/partidas", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...cabeceras() },
        body: JSON.stringify({ usuario, noche, puntuacion })
      }).then((r) =>
        r.json().then((data) => {
          if (!r.ok) throw new Error((data && data.message) || ("HTTP " + r.status));
        })
      );
    }
  };
})();
