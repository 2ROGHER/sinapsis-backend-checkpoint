import type { Periodo } from '../../vo';
import type { ReporteMensajesPorEstado } from '../../entities/mensaje';

/** Puerto de ENTRADA (driving port) de los reportes de mensajes. */
export interface ReporteUseCase {
  /**
   * Reporte de mensajes activos del periodo agrupados por estado de envío,
   * opcionalmente filtrado por cliente. El resultado siempre trae los 3 estados
   * representados (cantidad 0 si no hubo mensajes en ese estado).
   */
  generarReporteMensajes(periodo: Periodo, idCliente?: number): Promise<ReporteMensajesPorEstado>;
}
