import type { Knex } from 'knex';
import { addAuditColumns } from '../auditColumns';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('campania', (table) => {
    table.increments('idCampania').unsigned().primary();
    table.string('nombre', 200).notNullable();
    table.integer('idUsuario').unsigned().notNullable();
    table.datetime('fechaHoraProgramacion').notNullable();
    table.tinyint('estado').notNullable().defaultTo(1);
    addAuditColumns(knex, table);

    table
      .foreign('idUsuario', 'fk_campania_usuario')
      .references('usuario.idUsuario')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    table.index('idUsuario', 'idx_campania_idUsuario');
  });

  await knex.raw(
    'ALTER TABLE `campania` ADD CONSTRAINT `chk_campania_estado` CHECK (`estado` IN (0, 1))',
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('campania');
}
