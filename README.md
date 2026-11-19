# Sinapsis Backend Checkpoint

Prueba técnica Backend Semi-Senior para Sinapsis: API serverless (Node.js +
TypeScript + Express sobre AWS Lambda) con MySQL, arquitectura hexagonal + DDD,
documentada con OpenAPI 3.0.

Sinapsis permite a sus clientes programar campañas de marketing enviando mensajes
SMS. Este backend expone:

1. Un **reporte** de mensajes activos programados, clasificados por estado de
   envío (Pendiente/Enviado/Error), filtrable obligatoriamente por mes y
   opcionalmente por cliente.
2. Un endpoint para que los clientes **programen una campaña** (con sus
   mensajes).

> ⚠️ **Cómo probar este proyecto**: esta entrega **no incluye un deploy real a
> AWS** (no requiere cuenta AWS para evaluarse). El código está completo y
> listo para desplegar (`serverless.yml`, ver [`docs/DEPLOY.md`](docs/DEPLOY.md)),
> pero la verificación se hace **localmente**, con tu propio MySQL y
> `serverless-offline` (bonus requerimiento 7 del enunciado) — exactamente los
> pasos de [Quick start](#quick-start) de abajo. No busques una URL pública: no
> existe, a propósito.

> 📘 **Documentación OpenAPI** (generada a partir de [`docs/openapi.yaml`](docs/openapi.yaml)),
> dos vistas — ábrelas con doble clic:
>
> - [`docs/swagger-ui.html`](docs/swagger-ui.html): **Swagger UI**, con "Try it out"
>   (levanta la API con `npm run dev` y ejecuta los endpoints desde la página).
>   Autocontenido: funciona sin internet. Regenerar tras cambiar el contrato:
>   `npm run docs:swagger`.
> - [`docs/openapi-preview.html`](docs/openapi-preview.html): **Redoc**, lectura de solo
>   consulta (requiere internet para cargar el motor de renderizado). Regenerar:
>   `npm run docs:build`.

## Stack técnico

- **Node.js 20+** (Lambda runtime: `nodejs20.x`) + **TypeScript** (strict mode)
- **Express 4** (controllers/routers) ejecutado como una única función **AWS
  Lambda** vía `serverless-http` + **Serverless Framework v3** (+
  `serverless-offline` para desarrollo local)
- **MySQL 8** + **Knex** (migraciones y query builder)
- **zod** (validación de DTOs en el borde HTTP)
- **Jest + Supertest** (tests unitarios + tests HTTP contra la app Express real)
- Arquitectura **hexagonal (Ports & Adapters) + DDD**, principios **SOLID** y
  **Clean Architecture** — ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Quick start

Requiere un MySQL 8.x accesible (local o remoto) — no se usa Docker, solo el
MySQL que ya tengas instalado.

```powershell
npm install
Copy-Item .env.example .env   # ajusta las credenciales de tu MySQL local
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sips_checkpoint_db_dev;"
npm run migrate
npm run seed
npm run dev
```

API disponible en `http://localhost:3000/v1`. Guía completa, troubleshooting y
validación con Postman CLI en [`docs/LOCAL_SETUP.md`](docs/LOCAL_SETUP.md).

## Documentación

| Documento                                                | Contenido                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`docs/openapi.yaml`](docs/openapi.yaml)                 | Contrato OpenAPI 3.0 de los 3 endpoints                                              |
| [`docs/swagger-ui.html`](docs/swagger-ui.html)           | Swagger UI autocontenido con "Try it out" (generado, ábrelo directo en el navegador) |
| [`docs/openapi-preview.html`](docs/openapi-preview.html) | Documentación Redoc de solo lectura (generada)                                       |
| [`docs/postman/`](docs/postman)                          | Colección + environment Postman (validación end-to-end)                              |
| [`docs/database/schema.sql`](docs/database/schema.sql)   | DDL — script de datos (modelo MySQL)                                                 |
| [`docs/database/seed.sql`](docs/database/seed.sql)       | Datos de ejemplo                                                                     |
| [`docs/database/ER.md`](docs/database/ER.md)             | Diagrama ER (Mermaid) y convenciones del modelo                                      |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)           | Arquitectura hexagonal/DDD, decisiones técnicas, patrones usados y descartados       |
| [`docs/LOCAL_SETUP.md`](docs/LOCAL_SETUP.md)             | Guía de ejecución local paso a paso                                                  |
| [`docs/DEPLOY.md`](docs/DEPLOY.md)                       | Pasos de despliegue a AWS                                                            |

## Endpoints

| Método | Ruta                                                    | Descripción                                     |
| ------ | ------------------------------------------------------- | ----------------------------------------------- |
| `GET`  | `/v1/health`                                            | Health check                                    |
| `GET`  | `/v1/reports/messages-by-status?mes=YYYY-MM&idCliente=` | Reporte de mensajes activos por estado de envío |
| `POST` | `/v1/campaigns`                                         | Programar una campaña con sus mensajes          |

## Estructura del proyecto

```
src/
  domain/                 Núcleo (sin dependencias): entities/, port/input, port/output
  application/            service/ (implementan los puertos de entrada) y errors/
  infrastructure/
    adapter/input/web/    Adaptador primario: controller, dto, mapper, middleware, route, lambda
    adapter/output/persistence/  Adaptador secundario: *PersistenceAdapter, entity, mapper, database (Knex)
    configuration/        env, logger y composition-root (wiring manual de DI)
tests/
  unit/                Casos de uso + dominio, con repositorios en memoria
  http/                Tests Supertest contra la app Express real
docs/                  OpenAPI, Postman, DDL/seed, documentación de arquitectura
```

## Tests

```powershell
npm test               # unit + Supertest (sin base de datos real)
npm run test:coverage
```

## Autor

Roger Mestanza — rogers.mestanza@gmail.com
