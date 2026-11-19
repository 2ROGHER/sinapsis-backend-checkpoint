import type { Connection } from 'mysql2';

/**
 * Hook `pool.afterCreate`: fija la zona horaria de la SESIÓN de MySQL en UTC.
 *
 * La opción `timezone: 'Z'` del driver solo controla cómo mysql2 serializa y parsea
 * las fechas de JavaScript; NO cambia la zona de la sesión. Los defaults de la base
 * (`CURRENT_TIMESTAMP` en `createdAt`/`updatedAt`) usan la zona de la sesión, así que
 * sin esto quedarían en la hora local del servidor MySQL y mezclarían husos con las
 * fechas que escribe la aplicación.
 */
export function utcSession(
  connection: Connection,
  done: (error: Error | null, connection: Connection) => void,
): void {
  connection.query("SET time_zone = '+00:00'", (error) => done(error, connection));
}
