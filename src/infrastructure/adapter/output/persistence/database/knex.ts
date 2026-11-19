import knexBuilder, { type Knex } from 'knex';
import type { TypeCastField, TypeCastNext } from 'mysql2';
import { env } from '../../../../configuration/env';
import { utcSession } from './utcSession';

let instance: Knex | undefined;

/**
 * Singleton de Knex, creado una sola vez por contenedor de ejecución (módulo
 * cacheado por Node.js). En Lambda esto es crítico: el mismo contenedor se reusa
 * entre invocaciones "warm", así que crear el pool fuera del handler (a nivel de
 * módulo, llamando a getKnex() una vez en lambda.ts) evita abrir una conexión
 * MySQL nueva en cada request.
 *
 * `pool.max` se mantiene deliberadamente bajo (ver .env.example, DB_POOL_MAX=2):
 * cada contenedor Lambda concurrente tiene su propio pool, así que un `max` alto
 * multiplicado por alta concurrencia puede agotar `max_connections` de MySQL/RDS
 * rápidamente. Para producción a mayor escala, ver docs/DEPLOY.md (RDS Proxy).
 *
 * IMPORTANTE: nunca llamar a `instance.destroy()` dentro de un handler de request
 * — eso cerraría el pool que se pretende reutilizar en la siguiente invocación.
 */
export function getKnex(): Knex {
  if (!instance) {
    instance = knexBuilder({
      client: 'mysql2',
      connection: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        // Todas las fechas se escriben y leen como UTC, sin importar la zona horaria de
        // la máquina. Sin esto mysql2 usa la zona LOCAL: el mismo request guardaría
        // valores distintos en Windows (UTC-5) y en Lambda (UTC), y el rango mensual
        // del reporte (calculado en UTC por `Periodo`) fallaría en los bordes de mes.
        timezone: 'Z',
        typeCast: (field: TypeCastField, next: TypeCastNext) => {
          // mysql2 devuelve TINYINT(1) como boolean por defecto; nuestro modelo
          // trata `estado` como 0|1 numérico explícito (así está documentado en el
          // enunciado), así que desactivamos esa conversión implícita solo para
          // tinyint y dejamos el resto del type casting por defecto.
          if (field.type === 'TINY' && field.length === 1) {
            return field.string() === '1' ? 1 : 0;
          }
          return next();
        },
      },
      pool: {
        min: env.DB_POOL_MIN,
        max: env.DB_POOL_MAX,
        acquireTimeoutMillis: 5000,
        idleTimeoutMillis: 10000,
        afterCreate: utcSession,
      },
    });
  }
  return instance;
}
