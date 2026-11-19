import type { EstadoEnvio } from '@domain';

/**
 * Fila del `GROUP BY estadoEnvio` del reporte. `COUNT(*)` llega como string en
 * algunos drivers MySQL, de ahí `number | string`.
 */
export interface ConteoEstadoEntity {
  estadoEnvio: EstadoEnvio;
  cantidad: number | string;
}
