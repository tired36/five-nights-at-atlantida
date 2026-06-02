# Seguridad de la base de datos

## Regla de oro

**Nunca** pongas `MONGODB_URI` (ni contraseñas) en archivos que subas a GitHub, Discord, capturas o chats con la IA.

La contraseña de Atlas solo debe estar en:

| Dónde | Archivo / sitio |
|-------|------------------|
| Tu PC | `.env` en la raíz (y opcionalmente `server/.env`) |
| Producción | Vercel → Project → Settings → Environment Variables |

Esos archivos están en `.gitignore` y **no** se suben al repositorio.

## Configurar en local

```bash
cp .env.example .env
# Edita .env con tu URI real (solo en tu máquina)
```

`.env.example` usa placeholders `USUARIO` y `PASSWORD`; eso sí puede estar en Git.

## Antes de cada commit o push

```bash
npm run check-secrets
```

Si falla, has dejado una URI con contraseña real en algún archivo rastreado. Quítala y vuelve a intentar.

Opcional (hook automático):

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

## Si filtraste la contraseña por error

1. **Rota la contraseña** en [MongoDB Atlas](https://cloud.mongodb.com) → Database Access → Edit user → nueva contraseña.
2. Actualiza `MONGODB_URI` en `.env` local y en Vercel.
3. No confíes en “borrar el commit” sin rotar: puede quedar en el historial de Git.

## Qué hace el código

- La API **no** devuelve la URI ni mensajes de MongoDB con credenciales.
- Los `console.error` del servidor **enmascaran** contraseñas en logs.
- El frontend (`js/`) **no** contiene claves: solo llama a `/api/partidas`.

## Compartir el proyecto en equipo

- Envía el enlace del repo y `.env.example`.
- La URI real compártela por canal privado (no en el issue público de GitHub).
