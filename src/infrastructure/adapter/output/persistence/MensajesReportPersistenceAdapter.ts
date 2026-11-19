import type { Knex } from 'knex';
import type { MensajesReportQuery, Periodo, ReporteMensajesPorEstado } from '@domain';
import type { ConteoEstadoEntity } from './entity';
import { ReporteMensajesMapper } from './mapper';

/** Adaptador secundario (MySQL/Knex) que implementa el puerto de lectura `MensajesReportQuery`. */
export class MensajesReportPersistenceAdapter implements MensajesReportQuery {
  constructor(private readonly knex: Knex) {}

  async contarPorEstadoEnvio(
    periodo: Periodo,
    idCliente?: number,
  ): Promise<ReporteMensajesPorEstado> {
    let query = this.knex('mensaje as m')
      .select('m.estadoEnvio')
      .count<ConteoEstadoEntity[]>('m.idMensaje as cantidad')
      .where('m.estado', 1)
      .andWhere('m.fechaHoraEnvio', '>=', periodo.inicio)
      .andWhere('m.fechaHoraEnvio', '<', periodo.finExclusivo)
      .groupBy('m.estadoEnvio');

    // El join contra campania/usuario solo es necesario (y solo se paga su costo)
    // cuando se filtra por cliente. Sin `idCliente`, la query resuelve directo
    // contra el índice compuesto idx_mensaje_estado_fecha sin tocar otras tablas.
    if (idCliente !== undefined) {
      query = query
        .innerJoin('campania as c', 'c.idCampania', 'm.idCampania')
        .innerJoin('usuario as u', 'u.idUsuario', 'c.idUsuario')
        .andWhere('u.idCliente', idCliente);
    }

    return ReporteMensajesMapper.toDomain(await query);
  }
}
