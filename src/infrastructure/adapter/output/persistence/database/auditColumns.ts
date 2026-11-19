import type { Knex } from 'knex';

/**
 * Columnas de trazabilidad comunes a todas las tablas.
 *
 * - `createdAt`: la fija MySQL al insertar la fila.
 * - `updatedAt`: MySQL la actualiza sola en cada UPDATE (`ON UPDATE`).
 *
 * Las administra la base de datos (no la aplicación) para que sean fiables incluso
 * si alguien modifica filas por SQL directo, y con precisión de milisegundos para
 * poder ordenar eventos cercanos en reportes. Están en UTC porque cada conexión
 * fija `time_zone = '+00:00'` (ver `utcSession.ts`).
 *
 * Es un helper (no una migración): vive FUERA de `migrations/` a propósito, porque
 * Knex trata como migración todo archivo de esa carpeta.
 */
export function addAuditColumns(knex: Knex, table: Knex.CreateTableBuilder): void {
  table
    .datetime('createdAt', { precision: 3 })
    .notNullable()
    .defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));
  table
    .datetime('updatedAt', { precision: 3 })
    .notNullable()
    .defaultTo(knex.raw('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)'));
}
