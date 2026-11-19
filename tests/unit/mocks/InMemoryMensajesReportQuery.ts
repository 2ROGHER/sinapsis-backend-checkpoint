import type { EstadoEnvio, MensajesReportQuery, Periodo, ReporteMensajesPorEstado } from '@domain';

/**
 * Fila de prueba simplificada: en vez de modelar mensaje+campania+usuario por
 * separado (innecesario para probar el caso de uso), cada fila trae directamente
 * el `idCliente` al que "pertenecería" tras el join real — equivalente observable
 * a MensajesReportPersistenceAdapter sin necesitar una base de datos.
 */
export interface MensajeSeedRow {
  fechaHoraEnvio: Date;
  estadoEnvio: EstadoEnvio;
  estado: 0 | 1;
  idCliente: number;
}

export class InMemoryMensajesReportQuery implements MensajesReportQuery {
  constructor(private readonly seed: MensajeSeedRow[] = []) {}

  async contarPorEstadoEnvio(
    periodo: Periodo,
    idCliente?: number,
  ): Promise<ReporteMensajesPorEstado> {
    const filtrados = this.seed.filter(
      (m) =>
        m.estado === 1 &&
        periodo.incluye(m.fechaHoraEnvio) &&
        (idCliente === undefined || m.idCliente === idCliente),
    );

    const porEstado = new Map<EstadoEnvio, number>();
    for (const fila of filtrados) {
      porEstado.set(fila.estadoEnvio, (porEstado.get(fila.estadoEnvio) ?? 0) + 1);
    }

    const conteos = Array.from(porEstado.entries()).map(([estadoEnvio, cantidad]) => ({
      estadoEnvio,
      cantidad,
    }));

    return { conteos, total: filtrados.length };
  }
}
