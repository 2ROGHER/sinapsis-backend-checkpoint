import {
  ESTADOS_ENVIO_ORDENADOS,
  type ClienteRepository,
  type MensajesReportQuery,
  type Periodo,
  type ReporteMensajesPorEstado,
  type ReporteUseCase,
} from '@domain';
import { ClienteNoEncontradoError } from '../errors';

/**
 * Servicio de aplicación: implementa `ReporteUseCase`. Valida (si se filtra) que
 * el cliente exista y garantiza que el reporte traiga SIEMPRE los 3 estados de
 * envío, con cantidad 0 para los que no tienen mensajes.
 */
export class ReporteService implements ReporteUseCase {
  constructor(
    private readonly mensajesReportQuery: MensajesReportQuery,
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async generarReporteMensajes(
    periodo: Periodo,
    idCliente?: number,
  ): Promise<ReporteMensajesPorEstado> {
    if (idCliente !== undefined) {
      const cliente = await this.clienteRepository.findById(idCliente);
      if (!cliente) {
        throw new ClienteNoEncontradoError(idCliente);
      }
    }

    const reporte = await this.mensajesReportQuery.contarPorEstadoEnvio(periodo, idCliente);
    const cantidadPorEstado = new Map(reporte.conteos.map((c) => [c.estadoEnvio, c.cantidad]));

    return {
      conteos: ESTADOS_ENVIO_ORDENADOS.map((estadoEnvio) => ({
        estadoEnvio,
        cantidad: cantidadPorEstado.get(estadoEnvio) ?? 0,
      })),
      total: reporte.total,
    };
  }
}
