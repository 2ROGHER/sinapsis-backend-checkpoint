import type { ReporteMensajesPorEstado } from '@domain';
import type { ConteoEstadoEntity } from '../entity';

export const ReporteMensajesMapper = {
  /** Filas del GROUP BY → reporte de dominio (normaliza `cantidad` a number y calcula el total). */
  toDomain(rows: ConteoEstadoEntity[]): ReporteMensajesPorEstado {
    const conteos = rows.map((row) => ({
      estadoEnvio: row.estadoEnvio,
      cantidad: Number(row.cantidad),
    }));
    const total = conteos.reduce((acumulado, c) => acumulado + c.cantidad, 0);
    return { conteos, total };
  },
};
