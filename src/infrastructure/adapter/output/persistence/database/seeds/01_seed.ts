import type { Knex } from 'knex';

/**
 * Datos de ejemplo reproducibles, pensados para demostrar el endpoint de reporte
 * con resultados verificables y son exactamente los que valida la
 * colección de Postman (docs/postman/postman_collection.json).
 *
 * IDs fijados explícitamente (en vez de dejar el autoincremental libre) para que
 * el seed sea determinista entre corridas y los ejemplos de docs/tests sean estables.
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('mensaje').truncate();
  await knex('campania').truncate();
  await knex('usuario').truncate();
  await knex('cliente').truncate();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  await knex('cliente').insert([
    { idCliente: 1, nombre: 'Comercial Andina S.A.', estado: 1 },
    { idCliente: 2, nombre: 'Retail Pacífico Ltda.', estado: 1 },
  ]);

  await knex('usuario').insert([
    { idUsuario: 1, idCliente: 1, usuario: 'aperez', estado: 1 },
    { idUsuario: 2, idCliente: 1, usuario: 'mlopez', estado: 1 },
    { idUsuario: 3, idCliente: 2, usuario: 'jcastro', estado: 1 },
    // Usuario inactivo a propósito: permite probar manualmente (Postman/manual)
    // el caso 409 "usuario inactivo" de POST /v1/campaigns con idUsuario=4.
    { idUsuario: 4, idCliente: 2, usuario: 'rsilva', estado: 0 },
  ]);

  await knex('campania').insert([
    {
      idCampania: 1,
      nombre: 'Promo Black Friday 2026',
      idUsuario: 1,
      fechaHoraProgramacion: '2026-11-20 09:00:00',
      estado: 1,
    },
    {
      idCampania: 2,
      nombre: 'Recordatorio Pago Noviembre',
      idUsuario: 1,
      fechaHoraProgramacion: '2026-11-05 08:00:00',
      estado: 1,
    },
    {
      idCampania: 3,
      nombre: 'Campaña Navidad 2026',
      idUsuario: 2,
      fechaHoraProgramacion: '2026-12-15 10:00:00',
      estado: 1,
    },
    {
      idCampania: 4,
      nombre: 'Lanzamiento Producto Octubre',
      idUsuario: 3,
      fechaHoraProgramacion: '2026-10-01 09:00:00',
      estado: 1,
    },
  ]);

  await knex('mensaje').insert([
    // Campaña 1 (cliente 1) — noviembre: 2 Enviado, 1 Error, 1 Pendiente activos + 1 inactivo excluido
    {
      idCampania: 1,
      mensaje: '¡Black Friday llegó! 50% OFF en toda la tienda',
      fechaHoraEnvio: '2026-11-20 09:05:00',
      estadoEnvio: 2,
      estado: 1,
    },
    {
      idCampania: 1,
      mensaje: 'Últimas horas de Black Friday, no te lo pierdas',
      fechaHoraEnvio: '2026-11-20 09:06:00',
      estadoEnvio: 2,
      estado: 1,
    },
    {
      idCampania: 1,
      mensaje: 'Tuvimos un error al enviar tu promoción',
      fechaHoraEnvio: '2026-11-20 09:07:00',
      estadoEnvio: 3,
      estado: 1,
    },
    {
      idCampania: 1,
      mensaje: 'Recordatorio: Black Friday continúa mañana',
      fechaHoraEnvio: '2026-11-21 10:00:00',
      estadoEnvio: 1,
      estado: 1,
    },
    {
      idCampania: 1,
      mensaje: 'Mensaje de prueba descartado (no debe contarse)',
      fechaHoraEnvio: '2026-11-20 09:05:00',
      estadoEnvio: 2,
      estado: 0,
    },

    // Campaña 2 (cliente 1) — noviembre: 1 Enviado, 1 Pendiente
    {
      idCampania: 2,
      mensaje: 'Recuerda que tu pago de noviembre vence pronto',
      fechaHoraEnvio: '2026-11-05 08:10:00',
      estadoEnvio: 2,
      estado: 1,
    },
    {
      idCampania: 2,
      mensaje: 'Segundo recordatorio de pago de noviembre',
      fechaHoraEnvio: '2026-11-06 08:10:00',
      estadoEnvio: 1,
      estado: 1,
    },

    // Campaña 3 (cliente 1) — diciembre: 2 Pendiente
    {
      idCampania: 3,
      mensaje: 'Feliz Navidad de parte de Comercial Andina',
      fechaHoraEnvio: '2026-12-15 10:05:00',
      estadoEnvio: 1,
      estado: 1,
    },
    {
      idCampania: 3,
      mensaje: 'Últimos días para aprovechar ofertas navideñas',
      fechaHoraEnvio: '2026-12-15 10:06:00',
      estadoEnvio: 1,
      estado: 1,
    },

    // Campaña 4 (cliente 2) — octubre: 1 Enviado, 1 Error, 1 Pendiente
    {
      idCampania: 4,
      mensaje: 'Nuevo producto ya disponible: compra ahora',
      fechaHoraEnvio: '2026-10-01 09:05:00',
      estadoEnvio: 2,
      estado: 1,
    },
    {
      idCampania: 4,
      mensaje: 'Oferta de lanzamiento por tiempo limitado',
      fechaHoraEnvio: '2026-10-01 09:06:00',
      estadoEnvio: 3,
      estado: 1,
    },
    {
      idCampania: 4,
      mensaje: 'Segundo intento: oferta de lanzamiento',
      fechaHoraEnvio: '2026-10-02 09:00:00',
      estadoEnvio: 1,
      estado: 1,
    },
  ]);
}
