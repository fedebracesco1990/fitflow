# Deploy de FitFlow

Cómo poner FitFlow en producción con Docker. El repo incluye todo lo necesario; no hay ningún entorno publicado.

## Arquitectura

```
Navegador ──HTTPS──▶ proxy con TLS ──HTTP──▶ frontend (nginx :80)
                     (plataforma,              ├── /            → app Angular (PWA)
                      Caddy, Traefik)          ├── /api/        → backend :3000
                                               └── /socket.io/  → backend :3000 (WebSocket)
                                                                     │
                                                                     ▼
                                                             mysql :3306 (sin puerto público)
```

- [`docker-compose.prod.yml`](../docker-compose.prod.yml) levanta los tres contenedores.
- El frontend y la API comparten origen: no hace falta configurar CORS ni URLs absolutas.
- Imágenes: [`backend/Dockerfile`](../backend/Dockerfile) (Node 24, `node dist/main`) y [`frontend/Dockerfile`](../frontend/Dockerfile) (build de producción servido por nginx, configurado en [`frontend/nginx.conf`](../frontend/nginx.conf)).

## Antes del primer deploy

- [ ] **Rotar los secretos expuestos** en el historial del repo: revocar la clave de Firebase y generar `JWT_SECRET`, `JWT_REFRESH_SECRET` y `QR_JWT_SECRET` nuevos.
- [ ] **Configurar un SMTP real** para los emails de recuperación de contraseña (Gmail con contraseña de aplicación, Resend, etc.).
- [ ] **Tener HTTPS.** El service worker (PWA, modo offline) y las notificaciones push solo funcionan con HTTPS. El compose expone HTTP; el TLS lo pone la plataforma o un proxy delante (Caddy, Traefik).
- [ ] **Decidir cómo hacer backups** del volumen `fitflow_prod_mysql_data`.

## Pasos

1. Crear `.env.production` en la raíz a partir de [`.env.example`](../.env.example). El archivo está en `.gitignore`. Cambiar o agregar:

   | Variable                                            | Valor en producción                                                                 |
   | --------------------------------------------------- | ----------------------------------------------------------------------------------- |
   | `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD`             | Contraseñas largas y aleatorias                                                     |
   | `MYSQL_USER`, `MYSQL_DATABASE`                      | Iguales a `DB_USERNAME` y `DB_DATABASE`                                             |
   | `DB_PASSWORD`                                       | Igual a `MYSQL_PASSWORD`                                                            |
   | `DB_SYNCHRONIZE`                                    | `true` (ver Limitaciones)                                                           |
   | `FRONTEND_URL`, `ALLOWED_ORIGINS`                   | La URL pública, por ejemplo `https://fitflow.midominio.com`                         |
   | `JWT_SECRET`, `JWT_REFRESH_SECRET`, `QR_JWT_SECRET` | Nuevos (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
   | `SMTP_*`, `MAIL_FROM`                               | Los del proveedor de email                                                          |
   | `FIREBASE_*`                                        | La service account nueva (opcional: sin ella no hay push)                           |
   | `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`       | El primer administrador (ver abajo)                                                 |
   | `APP_PORT`                                          | Puerto del host donde escucha la app (por defecto `8080`)                           |

   `NODE_ENV=production`, `DB_HOST`, `DB_PORT` y `TRUST_PROXY` los fija el compose; no hace falta ponerlos.

2. Levantar el stack:

   ```bash
   npm run prod:up
   # equivale a: docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
   ```

3. Entrar con `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

### Primer administrador

En producción el seed no corre (no hay usuarios de prueba). Al arrancar, si la base **no tiene ningún administrador** y están definidas `ADMIN_EMAIL` y `ADMIN_PASSWORD`, el backend crea ese usuario. Cuando ya existe un admin no hace nada, así que después se pueden borrar esas variables. Conviene cambiar la contraseña desde el perfil después del primer ingreso.

## Operación

| Acción                         | Comando                                                   |
| ------------------------------ | --------------------------------------------------------- |
| Ver logs                       | `npm run prod:logs`                                       |
| Actualizar a la última versión | `git pull` y `npm run prod:up` (reconstruye las imágenes) |
| Detener (conserva los datos)   | `npm run prod:down`                                       |

## Dónde desplegar

- **Un servidor con Docker** (VPS): los pasos de arriba, más un proxy con HTTPS delante del puerto `APP_PORT`.
- **Plataformas que aceptan Docker Compose** (Dokploy, Coolify, etc.): apuntar al repo, usar `docker-compose.prod.yml` y cargar las variables de `.env.production` en la plataforma. La plataforma suele encargarse del HTTPS.
- **Railway, Render y similares** despliegan cada servicio por separado. Funciona con los mismos Dockerfiles, pero el frontend necesita `API_URL` con la URL absoluta del backend en el build, y hay que configurar `ALLOWED_ORIGINS` para CORS. La rama `fitflow-deploy` (diciembre de 2025, con un `Procfile` para Railway) está desactualizada y no sirve como base.

## Limitaciones conocidas

- **Esquema por `synchronize`.** No hay una migración inicial, así que en producción las tablas se crean y actualizan desde las entidades con `DB_SYNCHRONIZE=true`. Un cambio de entidad puede alterar columnas sin aviso: hacer un backup antes de cada actualización.
- **Sin backups automáticos** de MySQL.
- **Tokens en localStorage:** ver [session-management.md](./technical/session-management.md#token-storage-decisión-de-diseño).
