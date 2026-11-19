import type { Periodo } from '../../../vo';
import type { ReporteMensajesPorEstado } from '../../../entities/mensaje';

/**
 * Puerto de SALIDA (driven port) de solo lectura para el reporte.
 *
 * Es una consulta (read model), NO un repositorio: `Mensaje` no es raíz de
 * agregado (pertenece a `Campania`), y en DDD solo las raíces tienen repositorio.
 */
export interface MensajesReportQuery {
  /**
   * Cuenta los mensajes ACTIVOS cuyo `fechaHoraEnvio` cae dentro del periodo,
   * agrupados por estado de envío. Si `idCliente` se provee, filtra por los
   * mensajes de campañas de ese cliente. Devuelve solo los estados que tienen
   * mensajes: completar los faltantes con 0 es regla del caso de uso.
   */
  contarPorEstadoEnvio(periodo: Periodo, idCliente?: number): Promise<ReporteMensajesPorEstado>;
}
