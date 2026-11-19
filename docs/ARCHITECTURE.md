# Arquitectura

Backend en **TypeScript**, arquitectura **hexagonal (Ports & Adapters) + DDD**,
expuesto vía **Express** y ejecutado como una única función **AWS Lambda** detrás
de API Gateway HTTP API (a través de `serverless-http` + Serverless Framework).

## Hexagonal (Ports & Adapters) — mapa

El **hexágono** es `domain` + `application`. Se comunica con el exterior solo a
través de **puertos** (interfaces definidas en `domain/port`). Los **adaptadores**
(en `infrastructure/adapter`) los consumen o los implementan. Garantiza la escalabilidad del sistema, promueve el desacoplamiento de dependencias y insentiva las buenas prácticas de desarrallo de software profesional.

```
 ADAPTADOR PRIMARIO               HEXÁGONO                        ADAPTADOR SECUNDARIO
 (driving, entrada)                                               (driven, salida)

 adapter/input/web   ──▶  domain/port/input  (CampaniaUseCase)
 controller · dto ·              ▲ implements
 mapper · middleware     application/service (CampaniaService)
                                 │ usa
                          domain/port/output (CampaniaRepository)  ◀── implements ──  adapter/output/persistence
                                 │                                                     *PersistenceAdapter · entity · mapper
                          domain/entities (Campania, Mensaje…)                         (Knex → MySQL)
```

| Pieza                  | Dónde                                       | Qué es                                                                                  |
| ---------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------- |
| Puerto de entrada      | `domain/port/input/*UseCase.ts`             | Catálogo de acciones que el sistema ofrece. Interfaz.                                   |
| Servicio de aplicación | `application/service/*Service.ts`           | Implementa el puerto de entrada y orquesta el dominio. Solo conoce puertos de salida.   |
| Puerto de salida       | `domain/port/output/*.ts`                   | Lo que el dominio necesita del exterior (repositorios, consultas). Interfaz.            |
| Adaptador primario     | `infrastructure/adapter/input/web`          | Express: `controller` + `dto` + `mapper` + `middleware`. Traduce HTTP ↔ dominio.        |
| Adaptador secundario   | `infrastructure/adapter/output/persistence` | `*PersistenceAdapter` implementa el puerto; `entity` + `mapper` aíslan el esquema SQL.  |
| Composition root       | `infrastructure/configuration`              | Wiring manual de dependencias; único lugar que conoce adaptadores y servicios a la vez. |

## Regla de dependencia

```
domain/           cero dependencias externas ni de otras capas (solo TS y modelado)
   ↑
application/      depende SOLO de domain
   ↑
infrastructure/   adaptadores + configuración; depende de application, domain y librerías
```

Se hace cumplir con `no-restricted-imports` en `.eslintrc.cjs` (`npm run lint`
falla si `domain` o `application` importan `infrastructure`, o `domain` importa
`application`, o cualquiera de los dos importa Express, Knex, zod, etc.).

## Capas

### `src/domain/`

- **`entities/`**: `Cliente`, `Usuario`, `Campania` (**raíz de agregado**, contiene
  sus `Mensaje`) y `Mensaje`, con invariantes aplicadas en factory methods
  (`Campania.crear`, `Mensaje.crearPendiente`). `errors/` contiene los
  `DomainError`: violaciones de una invariante de negocio.
- **`port/input/`**: `CampaniaUseCase`, `ReporteUseCase`.
- **`port/output/`**: `CampaniaRepository`, `UsuarioRepository`, `ClienteRepository`,
  `MensajesReportQuery`. Solo usan tipos del dominio: un puerto nunca depende de
  tipos de `application` ni de `infrastructure`.
- `MensajesReportQuery` es una **consulta de lectura**, no un repositorio: `Mensaje`
  no es raíz de agregado y en DDD solo las raíces tienen repositorio.
- El `id` de `Campania` y `Mensaje` es opcional hasta que se persiste: `save`
  devuelve la entidad ya persistida con sus IDs.
- `Periodo` (value object) vive en `domain/vo`.

### `src/application/`

- **`service/`**: `CampaniaService` y `ReporteService`. Reciben y devuelven
  **entidades de dominio** (no DTOs): el mapeo HTTP ↔ dominio es responsabilidad
  del adaptador.
  - `CampaniaService.programar`: valida que el usuario exista y esté activo y
    delega la persistencia atómica en `CampaniaRepository.save`.
  - `ReporteService.generarReporteMensajes`: valida (si se filtra) que el cliente
    exista y garantiza que el reporte traiga SIEMPRE los 3 estados de envío.
- **`errors/`**: `ApplicationError` → `ResourceNotFoundError` / `ConflictError` y
  sus concretos (`UsuarioNoEncontradoError`, `ClienteNoEncontradoError`,
  `UsuarioInactivoError`). Son fallos de orquestación, distintos de los
  `DomainError`.

### `src/infrastructure/`

- **`adapter/input/web/`** (adaptador primario)
  - `controller/`: clases finas. Parsean con zod, mapean a dominio, llaman al
    puerto de entrada y mapean la respuesta. Sin lógica de negocio.
  - `dto/`: `ProgramarCampaniaRequest` y `ReporteMensajesRequest` (schema zod +
    tipo), `CampaniaResponse` y `ReporteMensajesResponse`.
  - `mapper/`: DTO ↔ entidad de dominio (`CampaniaRequestMapper`,
    `CampaniaResponseMapper`, …).
  - `route/`, `middleware/` (`asyncHandler`, `notFoundHandler`, `errorHandler`),
    `app.ts` y `lambda.ts`.
- **`adapter/output/persistence/`** (adaptador secundario)
  - `*PersistenceAdapter`: implementan los puertos de salida con Knex.
  - `entity/`: modelos de persistencia (filas de las tablas), distintos de las
    entidades de dominio.
  - `mapper/`: entidad de dominio ↔ modelo de persistencia.
  - `database/`: `knex.ts` (pool singleton), `knexfile.ts`, `migrations/`, `seeds/`.
- **`configuration/`**: `env.ts` (valida `process.env` con zod; falla rápido en el
  cold start), `logger.ts` y `composition-root.ts` (`buildMysqlAdapters`,
  `buildUseCases`).

## Barrel exports y aliases de importación

Cada carpeta con API pública tiene un `index.ts` (barrel). Entre capas se importa
**siempre por alias**, a través del barrel:

| Alias               | Apunta a             | Ejemplo                                                         |
| ------------------- | -------------------- | --------------------------------------------------------------- |
| `@domain`           | `src/domain`         | `import { Campania, type CampaniaUseCase } from '@domain'`      |
| `@application`      | `src/application`    | `import { CampaniaService } from '@application'`                |
| `@infrastructure/*` | `src/infrastructure` | `import { createApp } from '@infrastructure/adapter/input/web'` |

Reglas:

- **Dentro de una misma carpeta** se importa el archivo concreto (`./Mensaje`),
  nunca el `index.ts` propio: evita dependencias circulares.
- **Entre carpetas de la misma capa** se importa el barrel de la carpeta.
- **Entre capas** se usa el alias.
- **Fuera de los barrels a propósito:** `configuration/env.ts` (valida
  `process.env` al cargarse), `database/knex.ts` y `adapter/input/web/lambda.ts`
  (crean el pool MySQL al importarse), y `database/` completo (`knexfile.ts`,
  `migrations/`, `seeds/`): los carga el CLI de Knex por ruta y ts-node no resuelve
  aliases, por eso ahí se usan imports relativos.

Los aliases se declaran en `tsconfig.json` (`paths`) y `jest.config.js`
(`moduleNameMapper`); esbuild (`serverless-esbuild`) usa los `paths` del tsconfig.

## Por qué Express 4 necesita `asyncHandler`

Express 4 (a diferencia de Express 5) **no** captura automáticamente los rechazos
de promesas lanzados dentro de un handler `async`. Sin el wrapper
`infrastructure/adapter/input/web/middleware/asyncHandler.ts`, una excepción lanzada
dentro de un controller (p. ej. un `ZodError` o un `DomainError`) dejaría la
request colgada en vez de llegar al `errorHandler` centralizado.

## Manejo de errores centralizado

Un único middleware de error (`errorHandler.ts`) traduce:

- `ZodError` (forma/sintaxis inválida en el borde HTTP) → `400`, con el detalle de
  cada campo.
- `DomainError` (regla de negocio violada) → `400`.
- `ResourceNotFoundError` (usuario/cliente inexistente) → `404`.
- `ConflictError` (p. ej. usuario inactivo) → `409`.
  La traducción vive en infraestructura: ni el dominio ni la aplicación saben
  qué es un status code.
- Cualquier otro error (bug, fallo de infraestructura) → `500` genérico, con el
  detalle completo solo en el log (nunca en la respuesta al cliente).

## Conexión MySQL en Lambda

`src/infrastructure/adapter/output/persistence/database/knex.ts` expone un **singleton** creado a
nivel de módulo (no dentro del handler). Esto importa específicamente por el
modelo de ejecución de Lambda:

- El mismo contenedor de ejecución se reutiliza entre invocaciones "warm" —
  construir el pool de Knex fuera del handler evita abrir una conexión MySQL
  nueva en cada request.
- `pool.max` se mantiene deliberadamente bajo (`DB_POOL_MAX=2` por defecto): cada
  contenedor Lambda concurrente tiene su propio pool, así que un `max` alto
  multiplicado por alta concurrencia puede agotar `max_connections` de MySQL/RDS
  rápidamente.
- Cada invocación del handler (`lambda.ts`) setea
  `context.callbackWaitsForEmptyEventLoop = false`, para que Lambda no espere a
  que el event loop quede vacío (lo que forzaría a cerrar handles como la conexión
  MySQL) antes de devolver la respuesta.
- **Nunca** se llama `knex.destroy()` dentro de un handler de request.
- Para producción a mayor escala, la recomendación (no implementada en esta
  prueba, ver `docs/DEPLOY.md`) es colocar **RDS Proxy** delante de MySQL para
  absorber picos de conexiones concurrentes entre muchos contenedores Lambda.

## Patrones de diseño usados (y por qué)

| Patrón                               | Dónde                                                                          | Por qué                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Ports & Adapters                     | `domain/port/{input,output}` + `infrastructure/adapter/{input,output}`         | El dominio nunca conoce Express, Knex ni MySQL; los adaptadores son intercambiables.          |
| Application Service (use case)       | `application/service/*Service.ts`                                              | Implementa el puerto de entrada y orquesta el dominio usando solo puertos de salida.          |
| Repository (DIP)                     | `domain/port/output` + `*PersistenceAdapter`                                   | Contrato en el dominio, implementación en infraestructura.                                    |
| Dependency Injection por constructor | `infrastructure/configuration/composition-root.ts`                             | Wiring manual y explícito, sin "magia" de contenedor.                                         |
| DTO + Mapper                         | `adapter/input/web/{dto,mapper}`, `adapter/output/persistence/{entity,mapper}` | Ni un `req.body` ni una fila SQL contaminan el dominio; los casos de uso hablan en entidades. |
| Factory method en entidades          | `Campania.crear(...)`, `Mensaje.crearPendiente(...)`                           | Centraliza la aplicación de invariantes en la construcción.                                   |
| Value Object                         | `Periodo`                                                                      | Lógica de negocio real (parseo + cálculo de rango).                                           |

## Patrones explícitamente NO usados (para evitar sobre-ingeniería)

- **Unit of Work genérico**: la única operación transaccional multi-entidad de
  todo el sistema es "crear campaña + N mensajes". Se resuelve encapsulando
  `knex.transaction(...)` dentro de `CampaniaPersistenceAdapter.save`.
  Una abstracción de UoW separada movería la responsabilidad transaccional sin
  ningún beneficio real para un solo caso de uso que la necesita (YAGNI).
- **Framework de DI** (inversify/tsyringe): el grafo de dependencias tiene ~10
  objetos (2 casos de uso, 4 repositorios). Un contenedor con `reflect-metadata`
  añade latencia de cold start en Lambda y una capa de indirección a depurar, sin
  resolver ningún problema real (no hay bindings dinámicos ni scopes
  condicionales). El DIP ya se cumple con interfaces + constructor injection
  manual.
- **`Result<T, E>` monádico**: se usa `try/catch` + jerarquía de `DomainError` +
  middleware de error centralizado. Un tipo `Result` obligaría a desenvolver en
  cada punto de llamada sin aportar nada que el manejo de excepciones ya resuelva
  a este tamaño.
- **Strategy / Decorator / Observer / Chain-of-Responsibility / CQRS / Event
  Sourcing / Specification**: ninguno tiene un caso de uso real en 2 endpoints +
  health check. Se dejan fuera a propósito.
- **ORM (TypeORM/Prisma)**: se usa **Knex** (query builder plano, no ORM). Un ORM
  Active Record obligaría a que las entidades de dominio conocieran decoradores de
  infraestructura (`@Entity()`), rompiendo la regla de dependencia. Knex permite
  mapear fila↔entidad manualmente en el adaptador de persistencia, manteniendo el
  dominio 100% libre de dependencias, y su API de transacciones encaja
  exactamente con el requisito de atomicidad de campaña+mensajes.

## Testing

Dos niveles, sin duplicar cobertura sin valor (ver `docs/LOCAL_SETUP.md` para los
comandos):

- **Unit** (`tests/unit/`): servicios de aplicación con repositorios en memoria
  (`tests/unit/mocks/`), y entidades/value objects de dominio en aislamiento.
  Cubren reglas de negocio (usuario inactivo, cliente no encontrado, invariantes
  de entidad).
- **HTTP / Supertest** (`tests/http/`): contra la app Express real
  (`createApp(buildUseCases(puertosEnMemoria))`), sin servidor HTTP real ni
  `serverless-offline` corriendo. Cubren el contrato HTTP completo: status codes,
  forma de la respuesta, validación de zod en el borde.

`npm test` corre ambos niveles sin depender de una base de datos real — apto para CI. El
único caso que requeriría MySQL real (verificar atomicidad real de una transacción
fallida a mitad de camino) se cubre con mocks en el test por defecto; queda
documentado como posible extensión (tests de integración, no implementados en
esta entrega) para quien quiera verificarlo contra una base de datos real.

## Diagrama de despliegue

```
HTTP Request ─▶ API Gateway (HTTP API) ─▶ lambda.ts (serverless-http)
             ─▶ Express (adaptador primario) ─▶ puerto de entrada ─▶ servicio
             ─▶ puerto de salida ─▶ adaptador MySQL (Knex, pool singleton) ─▶ MySQL/RDS
```
