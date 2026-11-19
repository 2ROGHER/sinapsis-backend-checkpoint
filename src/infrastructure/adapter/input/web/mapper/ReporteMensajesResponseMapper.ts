import { estadoEnvioLabel, type Periodo, type ReporteMensajesPorEstado } from '@domain';
import type { ReporteMensajesResponse } from '../dto';

/** Reporte de dominio → DTO de salida (agrega las etiquetas legibles de cada estado). */
export const ReporteMensajesResponseMapper = {
  from(
    reporte: ReporteMensajesPorEstado,
    periodo: Periodo,
    idCliente?: number,
  ): ReporteMensajesResponse {
    return {
      mes: periodo.mes,
      idCliente: idCliente ?? null,
      resumen: reporte.conteos.map((c) => ({
        estadoEnvio: c.estadoEnvio,
        estado: estadoEnvioLabel(c.estadoEnvio),
        cantidad: c.cantidad,
      })),
      total: reporte.total,
    };
  },
};
