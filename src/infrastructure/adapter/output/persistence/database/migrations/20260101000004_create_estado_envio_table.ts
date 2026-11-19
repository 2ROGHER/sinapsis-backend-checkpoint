import type { Knex } from 'knex';
import { addAuditColumns } from '../auditColumns';

/**
 * Catálogo de estados de envío (3FN): en vez de repetir un código "mágico" (1, 2, 3)
 * en `mensaje.estadoEnvio` sin significado ni integridad referencial, el código se
 * define una sola vez aquí y `mensaje.estadoEnvio` pasa a ser FK hacia esta tabla.
 *
 * Son datos de REFERENCIA (forman parte del esquema, no son datos de ejemplo), por
 * eso se insertan en la migración y no en el seed. Deben coincidir con el enum
 * `EstadoEnvio` del dominio (lo verifica `tests/unit/infrastructure`).
 */
export const ESTADOS_ENVIO_CATALOGO = [
  { idEstadoEnvio: 1, nombre: 'Pendiente' },
  { idEstadoEnvio: 2, nombre: 'Enviado' },
  { idEstadoEnvio: 3, nombre: 'Error' },
] as const;

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('estado_envio', (table) => {
    // Signed INT sin autoincrement: debe coincidir con `mensaje.estadoEnvio INT` del
    // modelo del enunciado para poder declarar la FK, y los códigos son fijos.
    table.integer('idEstadoEnvio').notNullable().primary();
    table.string('nombre', 20).notNullable().unique('uq_estado_envio_nombre');
    addAuditColumns(knex, table);
  });

  await knex('estado_envio').insert(ESTADOS_ENVIO_CATALOGO.map((estado) => ({ ...estado })));
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('estado_envio');
}
