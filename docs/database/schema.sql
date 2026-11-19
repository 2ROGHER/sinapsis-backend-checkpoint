-- ============================================================================
-- Sinapsis Backend Checkpoint — Script de datos (DDL)
-- ============================================================================
-- Refleja 1:1 las migraciones Knex en
-- src/infrastructure/adapter/output/persistence/database/migrations/*.ts
--
-- Pensado para que un revisor pueda levantar el esquema SIN instalar Node:
--   mysql -u root -p < docs/database/schema.sql
--   mysql -u root -p sips_checkpoint_db_dev < docs/database/seed.sql
--
-- NOTA IMPORTANTE sobre `mensaje.idCampania`: el enunciado de la prueba técnica no
-- lista esta columna en el modelo de `mensaje`, pero el diagrama ER dibuja la
-- relación `campania -> mensaje`. Se añade como FK obligatoria: es imprescindible
-- para poder filtrar el reporte por cliente (join mensaje -> campania -> usuario ->
-- cliente) y para que el modelo tenga sentido relacional. Ver docs/database/ER.md.
--
-- NOTA sobre el nombre de las tablas (minúsculas): MySQL es case-sensitive para
-- nombres de tabla en Linux (`lower_case_table_names=0`, el default en la mayoría
-- de despliegues MySQL/RDS sobre Linux, incluyendo el destino de este proyecto:
-- AWS) pero case-insensitive en Windows. Usar siempre minúsculas evita por
-- completo esa clase de bug de portabilidad entre el entorno de desarrollo local
-- y producción — es la misma convención que usan las migraciones Knex, los
-- repositorios TypeScript y Rails/Django/Laravel para el mismo motivo.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS sips_checkpoint_db_dev
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sips_checkpoint_db_dev;

-- Los DEFAULT CURRENT_TIMESTAMP de createdAt/updatedAt usan la zona horaria de la
-- SESIÓN: se fija en UTC (igual que hace la aplicación al abrir cada conexión).
SET time_zone = '+00:00';

-- ----------------------------------------------------------------------------
-- cliente
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cliente (
  idCliente INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre    VARCHAR(100) NOT NULL,
  estado    TINYINT NOT NULL DEFAULT 1,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (idCliente),
  CONSTRAINT chk_cliente_estado CHECK (estado IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- usuario
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
  idUsuario INT UNSIGNED NOT NULL AUTO_INCREMENT,
  idCliente INT UNSIGNED NOT NULL,
  usuario   VARCHAR(30) NOT NULL,
  estado    TINYINT NOT NULL DEFAULT 1,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (idUsuario),
  KEY idx_usuario_idCliente (idCliente),
  CONSTRAINT fk_usuario_cliente FOREIGN KEY (idCliente)
    REFERENCES cliente (idCliente) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_usuario_estado CHECK (estado IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- campania
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campania (
  idCampania            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre                VARCHAR(200) NOT NULL,
  idUsuario             INT UNSIGNED NOT NULL,
  fechaHoraProgramacion DATETIME NOT NULL,
  estado                TINYINT NOT NULL DEFAULT 1,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (idCampania),
  KEY idx_campania_idUsuario (idUsuario),
  CONSTRAINT fk_campania_usuario FOREIGN KEY (idUsuario)
    REFERENCES usuario (idUsuario) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_campania_estado CHECK (estado IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- estado_envio  (catálogo, 3FN) — datos de REFERENCIA, forman parte del esquema
-- ----------------------------------------------------------------------------
-- Reemplaza el código "mágico" 1/2/3 de mensaje.estadoEnvio por una tabla con
-- integridad referencial. mensaje.estadoEnvio sigue siendo INT (como en el
-- enunciado) pero ahora es FK hacia esta tabla.
CREATE TABLE IF NOT EXISTS estado_envio (
  idEstadoEnvio INT NOT NULL,
  nombre        VARCHAR(20) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (idEstadoEnvio),
  UNIQUE KEY uq_estado_envio_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO estado_envio (idEstadoEnvio, nombre) VALUES
  (1, 'Pendiente'),
  (2, 'Enviado'),
  (3, 'Error');

-- ----------------------------------------------------------------------------
-- mensaje  (idCampania: FK añadida — ver nota al inicio del archivo)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mensaje (
  idMensaje      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  idCampania     INT UNSIGNED NOT NULL,
  estadoEnvio    INT NOT NULL,
  fechaHoraEnvio DATETIME NOT NULL,
  mensaje        VARCHAR(160) NOT NULL,
  estado         TINYINT NOT NULL DEFAULT 1,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (idMensaje),
  KEY idx_mensaje_idCampania (idCampania),
  KEY idx_mensaje_estado_fecha (estado, fechaHoraEnvio),
  CONSTRAINT fk_mensaje_campania FOREIGN KEY (idCampania)
    REFERENCES campania (idCampania) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_mensaje_estado_envio FOREIGN KEY (estadoEnvio)
    REFERENCES estado_envio (idEstadoEnvio) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_mensaje_estado CHECK (estado IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índice compuesto idx_mensaje_estado_fecha: el reporte siempre filtra por
-- `estado = 1` (activo) + un rango de `fechaHoraEnvio` (el mes solicitado). Este
-- índice permite resolver ambos predicados con un único acceso de índice, sin
-- aplicar MONTH()/YEAR() sobre la columna (lo que invalidaría cualquier índice).
