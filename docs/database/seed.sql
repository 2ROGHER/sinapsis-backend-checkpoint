-- ============================================================================
-- Sinapsis Backend Checkpoint — Datos de ejemplo (seed)
-- ============================================================================
-- Refleja 1:1 src/infrastructure/adapter/output/persistence/database/seeds/01_seed.ts
-- Ejecutar DESPUÉS de docs/database/schema.sql:
--   mysql -u root -p sips_checkpoint_db_dev < docs/database/seed.sql
--
-- Los conteos esperados por mes/cliente para el endpoint de reporte están
-- verificados por la colección de Postman (docs/postman/postman_collection.json).
-- ============================================================================

USE sips_checkpoint_db_dev;

-- Sesión en UTC: createdAt/updatedAt se llenan con DEFAULT CURRENT_TIMESTAMP.
SET time_zone = '+00:00';

-- No se toca `estado_envio`: es el catálogo de referencia y lo crea schema.sql.
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE mensaje;
TRUNCATE TABLE campania;
TRUNCATE TABLE usuario;
TRUNCATE TABLE cliente;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO cliente (idCliente, nombre, estado) VALUES
  (1, 'Comercial Andina S.A.', 1),
  (2, 'Retail Pacífico Ltda.', 1);

INSERT INTO usuario (idUsuario, idCliente, usuario, estado) VALUES
  (1, 1, 'aperez', 1),
  (2, 1, 'mlopez', 1),
  (3, 2, 'jcastro', 1),
  -- Usuario inactivo a propósito: permite probar el caso 409 "usuario inactivo"
  -- de POST /v1/campaigns usando idUsuario=4.
  (4, 2, 'rsilva', 0);

INSERT INTO campania (idCampania, nombre, idUsuario, fechaHoraProgramacion, estado) VALUES
  (1, 'Promo Black Friday 2026', 1, '2026-11-20 09:00:00', 1),
  (2, 'Recordatorio Pago Noviembre', 1, '2026-11-05 08:00:00', 1),
  (3, 'Campaña Navidad 2026', 2, '2026-12-15 10:00:00', 1),
  (4, 'Lanzamiento Producto Octubre', 3, '2026-10-01 09:00:00', 1);

INSERT INTO mensaje (idCampania, mensaje, fechaHoraEnvio, estadoEnvio, estado) VALUES
  -- Campaña 1 (cliente 1) — noviembre: 2 Enviado, 1 Error, 1 Pendiente activos
  -- + 1 mensaje inactivo (estado=0) que el reporte debe excluir.
  (1, '¡Black Friday llegó! 50% OFF en toda la tienda', '2026-11-20 09:05:00', 2, 1),
  (1, 'Últimas horas de Black Friday, no te lo pierdas', '2026-11-20 09:06:00', 2, 1),
  (1, 'Tuvimos un error al enviar tu promoción', '2026-11-20 09:07:00', 3, 1),
  (1, 'Recordatorio: Black Friday continúa mañana', '2026-11-21 10:00:00', 1, 1),
  (1, 'Mensaje de prueba descartado (no debe contarse)', '2026-11-20 09:05:00', 2, 0),

  -- Campaña 2 (cliente 1) — noviembre: 1 Enviado, 1 Pendiente
  (2, 'Recuerda que tu pago de noviembre vence pronto', '2026-11-05 08:10:00', 2, 1),
  (2, 'Segundo recordatorio de pago de noviembre', '2026-11-06 08:10:00', 1, 1),

  -- Campaña 3 (cliente 1) — diciembre: 2 Pendiente
  (3, 'Feliz Navidad de parte de Comercial Andina', '2026-12-15 10:05:00', 1, 1),
  (3, 'Últimos días para aprovechar ofertas navideñas', '2026-12-15 10:06:00', 1, 1),

  -- Campaña 4 (cliente 2) — octubre: 1 Enviado, 1 Error, 1 Pendiente
  (4, 'Nuevo producto ya disponible: compra ahora', '2026-10-01 09:05:00', 2, 1),
  (4, 'Oferta de lanzamiento por tiempo limitado', '2026-10-01 09:06:00', 3, 1),
  (4, 'Segundo intento: oferta de lanzamiento', '2026-10-02 09:00:00', 1, 1);
