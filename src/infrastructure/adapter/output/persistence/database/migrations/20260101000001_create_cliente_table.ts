import type { Knex } from 'knex';
import { addAuditColumns } from '../auditColumns';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('cliente', (table) => {
    table.increments('idCliente').unsigned().primary();
    table.string('nombre', 100).notNullable();
    table.tinyint('estado').notNullable().defaultTo(1);
    addAuditColumns(knex, table);
  });

  await knex.raw(
    'ALTER TABLE `cliente` ADD CONSTRAINT `chk_cliente_estado` CHECK (`estado` IN (0, 1))',
  );
}
/**
 * Funcion down, es una funcion de knex, que permite realizar la modificacion de la tabla.
 */

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('cliente');
}
