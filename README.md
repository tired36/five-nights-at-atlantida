# five-nights-at-atlantida

nombre : five nights at atlantida  
Integrantes del grupo : jairo, hugo, javi, alex

En este juego pasarás unas noches en Atlántida Formación Profesional, donde debes aguantar desde las 00:00 hasta las 06:00 sin que te pillen Germán, Alonso y la gordita. Hay mecánicas de energía, puertas, luces y cámaras. El objetivo sería aguantar 5 noches; cada noche tiene distintos personajes, a su vez con distintos comportamientos, rutas y mecánicas para disuadirlos o para interactuar con ellos, haciendo que las primeras noches los conozcas uno a uno, pero en las últimas tendrás que enfrentarte a varios a la vez, haciéndolo un juego divertido y desafiante :D

## Instrucciones de juego

### Objetivo

Eres el vigilante nocturno del centro **Atlántida FP**. Debes **sobrevivir de las 12:00 AM a las 6:00 AM** sin que te pillen los animatrónicos. El reloj avanza **1 hora de juego por cada minuto real** (una noche dura unos **6 minutos**).

### Cómo empezar

1. Abre `index.html` en el navegador (intro en vídeo).
2. En el menú: **Nueva partida** → elige la noche.
3. Lee las **normas de seguridad** y pulsa **Avanzar**.
4. Haz **clic** en la pantalla la primera vez para activar sonido y vídeo.

### Controles (ratón o táctil)

| Acción | Cómo |
|--------|------|
| **Cámaras** | Botón *Subir Cámaras* |
| **Volver a la oficina** | *Bajar Cámaras* |
| **Cambiar sala** | CAM 1, CAM 2, CAM 3, CAM 4 |
| **Linterna** | Mantén **clic** (o toque) sobre la imagen de la cámara |
| **Puerta** | *Cerrar Puerta* / *Abrir Puerta* |
| **Audio** | Botón ♫ *Usar Audio* (solo si el enemigo está en esa cámara) |

### Recursos

- **Energía (100%)**: si llega a **0%**, se apagan cámaras y puerta y quedas indefenso.
- Gasta energía al usar **cámaras**, **linterna**, **puerta cerrada** y el **audio** de retención.
- Vigila el contador arriba a la derecha.

### Mecánicas principales

**Puerta**

- Ciérrala cuando el enemigo esté cerca de la oficina (Sala 4 → oficina).
- Si está en la puerta con la puerta cerrada, **golpea** y te quita energía; luego vuelve a una sala al azar.
- Si llega con la **puerta abierta**, **game over**.

**Cámaras y linterna**

- Las salas se ven oscuras hasta que mantienes la linterna.
- El botón de la cámara donde está el enemigo se marca en **rojo** (pista visual).

**Audio**

- En la cámara del enemigo, el audio lo **retiene** unos segundos para que no avance.
- Tiene **enfriamiento** antes de poder usarlo otra vez.

**Aura**

- Si miras demasiado tiempo seguido la cámara del enemigo, su “aura” te **drena energía**. Cambia de cámara si te avisa el juego.

### Noches (disponibles)

| Noche | Enemigo | Notas |
|-------|---------|--------|
| **1** | **Germán** | Más lento; audio lo retiene **20 s** (recarga **30 s**); golpes de puerta **-10%** energía |
| **2** | **Alonso** | Más rápido y agresivo; audio **15 s** (recarga **25 s**); golpes **-15%** energía |
| **3–5** | Varios (incl. **la gordita**) | En desarrollo |

### Consejos

- No dejes la puerta cerrada sin necesidad: gasta mucha energía.
- Usa el audio con cabeza, no solo cuando ya esté en la puerta.
- Revisa las cámaras con linterna, pero no te quedes fijo en la del enemigo.
- En la noche 2, Alonso se mueve más rápido: prioriza puerta y cámaras.

### Victoria y derrota

- **Victoria**: llegar a las **6:00 AM**.
- **Derrota**: el enemigo entra en la oficina, o te quedas sin energía en el momento crítico.

> **Nota:** el juego está pensado para **5 noches**; en el menú solo están jugables la **1** y la **2** por ahora.

## Ranking (MongoDB)

Al terminar una partida se guarda en **FNAA → usuarios** (Atlas). En **RANKING** ves el top 10 por noche.

### Desplegar en Vercel (recomendado, funciona en internet)

1. **Sube el proyecto a GitHub** (toda la carpeta del juego).

2. Entra en [vercel.com](https://vercel.com) → **Add New Project** → importa tu repo de GitHub.

3. **Variables de entorno** (Settings → Environment Variables). Añade estas tres (marca Production, Preview y Development):

   | Nombre | Valor |
   |--------|--------|
   | `MONGODB_URI` | `mongodb+srv://usuario:contraseña@fnat.mk0pu0b.mongodb.net/` |
   | `MONGODB_DB` | `FNAA` |
   | `MONGODB_COLLECTION` | `usuarios` |

4. **MongoDB Atlas** → **Network Access** → **Add IP Address** → `0.0.0.0/0` (permite que Vercel se conecte).

5. Pulsa **Deploy**. Cuando termine, abre la URL que te da Vercel (ej. `https://tu-proyecto.vercel.app`).

6. Prueba:
   - `https://tu-proyecto.vercel.app/api/health` → debe mostrar `"total": 20` (o más).
   - Juega una noche, termina partida → debe decir "Guardado en el ranking".
   - `https://tu-proyecto.vercel.app/ranking.html` → tablas con datos.

**Importante:** en Vercel no hace falta `node server.js`; la carpeta `api/` es el servidor automático.

### Probar en local

1. En `server/`: copia `.env.example` a `.env` con tu `MONGODB_URI`.
2. `node server.js` (o doble clic en `start.bat`).
3. Abre **http://localhost:3000/menu.html**.

## Código del juego

| Archivo | Qué hace |
|---------|----------|
| `js/utilidades.js` | Subtítulos, energía, golpes en puerta (común) |
| `js/ranking.js` | Puntuación y pantallas de usuario |
| `js/ranking-api.js` | Peticiones al servidor (guardar / top 10) |
| `js/ranking-pagina.js` | Pantalla de ranking |
| `api/partidas.js` | API en Vercel (guardar / leer ranking) |
| `lib/mongodb.js` | Conexión a MongoDB (Vercel y local) |
| `server/server.js` | Servidor local opcional (desarrollo) |
| `js/noche1.js` / `js/noche2.js` | Lógica de cada noche (config arriba del archivo) |

**Puntos:** +3 cada segundo; puerta −40 (pausa mientras cerrada); audio −28/−32 (pausa hasta que acabe retención + recarga).
