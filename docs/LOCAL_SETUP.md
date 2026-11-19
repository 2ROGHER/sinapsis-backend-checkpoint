# Guía de ejecución local

## Requisitos

- Node.js 20+ (recomendado 22, ver `.nvmrc`).
- Un servidor MySQL 8.x accesible (local o remoto) con el cliente `mysql` CLI.
- Postman CLI (opcional, para correr la colección de validación end-to-end).

No se requiere Docker: el único requisito de infraestructura es un MySQL
accesible — típicamente el que ya tengas instalado localmente.

## 1. Variables de entorno

```powershell
Copy-Item .env.example .env
```

Edita `.env` con las credenciales de tu MySQL local (`DB_USER`, `DB_PASSWORD`,
`DB_HOST`, etc.).

## 2. Base de datos

### Opción A (recomendada): migraciones Knex

```powershell
npm install
npm run migrate
npm run seed
```

`npm run migrate` crea las 5 tablas (4 del modelo + el catálogo `estado_envio`) (ver
`src/infrastructure/adapter/output/persistence/database/migrations/`) directamente en el MySQL
apuntado por tu `.env`. `npm run seed` carga los datos de ejemplo (ver
la colección de Postman en `docs/postman/` para los conteos esperados).

> Nota: Knex necesita que la base de datos (`sips_checkpoint_db_dev` por
> defecto — el nombre viene de `DB_NAME` en tu `.env`) ya exista antes de
> migrar. Créala una vez con tu cliente MySQL habitual, por ejemplo:
> `mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sips_checkpoint_db_dev;"`

Comandos adicionales:

```powershell
npm run migrate:status      # ver qué migraciones se aplicaron
npm run migrate:rollback    # revertir la última migración
npm run db:reset            # rollback completo + migrate + seed (reinicio limpio)
```

### Opción B: sin Node, con el cliente `mysql` directo

Si prefieres no usar las migraciones Knex y cargar el esquema tal cual:

```powershell
mysql -u root -p < docs/database/schema.sql
mysql -u root -p sips_checkpoint_db_dev < docs/database/seed.sql
```

No mezclar ambas opciones sobre la misma base de datos (la opción A usa Knex
para trackear qué migraciones se aplicaron; la opción B no lo sabe).

## 3. Levantar la API localmente

```powershell
npm run dev
```

Levanta `serverless-offline` en `http://localhost:3000`, emulando API Gateway +
Lambda (bonus requerimiento 7 del enunciado). Verificación rápida:

```powershell
curl http://localhost:3000/v1/health
curl "http://localhost:3000/v1/reports/messages-by-status?mes=2026-11&idCliente=1"
```

## 4. Validación end-to-end con Postman CLI

Con `npm run dev` corriendo en otra terminal:

```powershell
postman collection run docs/postman/postman_collection.json -e docs/postman/postman_environment.json
```

Corre 15 requests (health + 8 casos de reporte + 6 casos de campañas) con
aserciones sobre status code y forma/valores de la respuesta, usando los datos
exactos del seed.

## 5. Tests unitarios

No requieren MySQL corriendo (usan repositorios en memoria):

```powershell
npm test
npm run test:coverage
```

## 6. Calidad de código

```powershell
npm run typecheck
npm run lint
npm run format:check
```

## Resumen de scripts npm

| Script                                                    | Qué hace                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------ |
| `npm run dev`                                             | `serverless offline`, API local en `:3000`                         |
| `npm run migrate` / `migrate:rollback` / `migrate:status` | Migraciones Knex                                                   |
| `npm run seed`                                            | Carga datos de ejemplo                                             |
| `npm run db:reset`                                        | Rollback completo + migrate + seed                                 |
| `npm test` / `test:coverage`                              | Unit + Supertest (sin base de datos real)                          |
| `npm run build`                                           | Empaqueta la Lambda (`serverless package` → `.serverless/api.zip`) |
| `npm run typecheck`                                       | `tsc --noEmit`                                                     |
| `npm run lint` / `lint:fix`                               | ESLint                                                             |
| `npm run format` / `format:check`                         | Prettier                                                           |
| `npm run docs:lint`                                       | Valida `docs/openapi.yaml` (Redocly)                               |
| `npm run docs:build`                                      | Regenera `docs/openapi-preview.html` (Redoc, solo lectura)         |
| `npm run docs:swagger`                                    | Regenera `docs/swagger-ui.html` (Swagger UI con "Try it out")      |
