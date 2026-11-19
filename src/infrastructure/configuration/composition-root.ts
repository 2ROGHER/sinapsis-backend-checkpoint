import type { Knex } from 'knex';
import type {
  CampaniaRepository,
  CampaniaUseCase,
  ClienteRepository,
  MensajesReportQuery,
  ReporteUseCase,
  UsuarioRepository,
} from '@domain';
import { CampaniaService, ReporteService } from '@application';
import {
  CampaniaPersistenceAdapter,
  ClientePersistenceAdapter,
  MensajesReportPersistenceAdapter,
  UsuarioPersistenceAdapter,
} from '../adapter/output/persistence';

/**
 * Composition root (equivalente a la `BeanConfiguration` de Spring): el ÚNICO
 * lugar que conoce a la vez los adaptadores concretos y los servicios de
 * aplicación. Hace el wiring manual por constructor, sin framework de DI (ver
 * docs/ARCHITECTURE.md).
 *
 * - `OutputPorts`: puertos de SALIDA. Producción los satisface con
 *   `buildMysqlAdapters`; los tests, con implementaciones en memoria.
 * - `UseCases`: puertos de ENTRADA ya implementados, que consumen los adaptadores
 *   primarios (HTTP). Son interfaces: los controllers nunca ven los servicios.
 */
export interface OutputPorts {
  clienteRepository: ClienteRepository;
  usuarioRepository: UsuarioRepository;
  campaniaRepository: CampaniaRepository;
  mensajesReportQuery: MensajesReportQuery;
}

export interface UseCases {
  campaniaUseCase: CampaniaUseCase;
  reporteUseCase: ReporteUseCase;
}

export function buildMysqlAdapters(knex: Knex): OutputPorts {
  return {
    clienteRepository: new ClientePersistenceAdapter(knex),
    usuarioRepository: new UsuarioPersistenceAdapter(knex),
    campaniaRepository: new CampaniaPersistenceAdapter(knex),
    mensajesReportQuery: new MensajesReportPersistenceAdapter(knex),
  };
}

export function buildUseCases(outputPorts: OutputPorts): UseCases {
  return {
    campaniaUseCase: new CampaniaService(
      outputPorts.usuarioRepository,
      outputPorts.campaniaRepository,
    ),
    reporteUseCase: new ReporteService(
      outputPorts.mensajesReportQuery,
      outputPorts.clienteRepository,
    ),
  };
}
