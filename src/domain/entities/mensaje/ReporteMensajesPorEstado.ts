import type { EstadoEnvio } from './EstadoEnvio';

/** Una línea del reporte: cantidad de mensajes activos para un estado de envío dado. */
export interface ConteoPorEstado {
  estadoEnvio: EstadoEnvio;
  cantidad: number;
}

/**
 * Resultado puro (sin comportamiento) del conteo de mensajes por estado de envío.
 * Siempre debe traer los 3 estados representados (cantidad 0 si no hubo mensajes),
 * para que el consumidor del reporte reciba una forma predecible.
 */
export interface ReporteMensajesPorEstado {
  conteos: ConteoPorEstado[];
  total: number;
}
