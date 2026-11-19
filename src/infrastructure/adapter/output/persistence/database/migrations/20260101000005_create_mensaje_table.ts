import type { Knex } from 'knex';
import { addAuditColumns } from '../auditColumns';

/**
 * Tabla `mensaje`. NOTA sobre `idCampania`: el PDF del enunciado no lista esta
 * columna explícitamente en el modelo de `mensaje`, pero el diagrama ER dibuja la
 * relación `campania -> mensaje`. Se añade como FK obligatoria porque sin ella el
 * modelo no tiene forma de saber a qué campaña (y por lo tanto a qué cliente)
 * pertenece cada mensaje — imprescindible para el endpoint de reporte filtrable
 * por cliente. Ver docs/database/ER.md para el detalle de esta decisión.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('mensaje', (table) => {
    table.increments('idMensaje').unsigned().primary();
    table.integer('idCampania').unsigned().notNullable();
    // INT tal como define el enunciado; ahora con FK al catálogo `estado_envio`
    // (1=Pendiente, 2=Enviado, 3=Error) en lugar de un código sin integridad.
    table.integer('estadoEnvio').notNullable();
    table.datetime('fechaHoraEnvio').notNullable();
    table.string('mensaje', 160).notNullable();
    table.tinyint('estado').notNullable().defaultTo(1);
    addAuditColumns(knex, table);

    table
      .foreign('estadoEnvio', 'fk_mensaje_estado_envio')
      .references('estado_envio.idEstadoEnvio')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    table
      .foreign('idCampania', 'fk_mensaje_campania')
      .references('campania.idCampania')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.index('idCampania', 'idx_mensaje_idCampania');
    // Índice compuesto clave para el reporte: filtra siempre por estado=1 (activo)
    // + rango de fechaHoraEnvio en un único acceso de índice, en vez de dos índices
    // separados combinados por intersección.
    table.index(['estado', 'fechaHoraEnvio'], 'idx_mensaje_estado_fecha');
  });

  await knex.raw(
    'ALTER TABLE `mensaje` ADD CONSTRAINT `chk_mensaje_estado` CHECK (`estado` IN (0, 1))',
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('mensaje');
}
