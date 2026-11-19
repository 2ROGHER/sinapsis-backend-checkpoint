import type { Knex } from 'knex';
import { addAuditColumns } from '../auditColumns';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('usuario', (table) => {
    table.increments('idUsuario').unsigned().primary();
    table.integer('idCliente').unsigned().notNullable();
    table.string('usuario', 30).notNullable();
    table.tinyint('estado').notNullable().defaultTo(1);
    addAuditColumns(knex, table);

    table
      .foreign('idCliente', 'fk_usuario_cliente')
      .references('cliente.idCliente')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    table.index('idCliente', 'idx_usuario_idCliente');
  });

  await knex.raw(
    'ALTER TABLE `usuario` ADD CONSTRAINT `chk_usuario_estado` CHECK (`estado` IN (0, 1))',
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('usuario');
}
