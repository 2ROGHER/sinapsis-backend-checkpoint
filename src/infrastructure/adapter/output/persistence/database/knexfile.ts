import type { Knex } from 'knex';
import { env } from '../../../../configuration/env';
import { utcSession } from './utcSession';

/**
 * Config usada SOLO por el CLI de Knex (`npm run migrate` / `npm run seed`).
 * El runtime de la app (Lambda/Express) usa exclusivamente `knex.ts` (el singleton
 * con pool reutilizable); este archivo nunca se importa desde ahí.
 */
const config: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    timezone: 'Z', // mismo criterio UTC que knex.ts
  },
  // Sesión en UTC: los DEFAULT CURRENT_TIMESTAMP de createdAt/updatedAt deben ser UTC.
  pool: { afterCreate: utcSession },
  migrations: {
    directory: './migrations',
    extension: 'ts',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './seeds',
    extension: 'ts',
  },
};

export default config;
