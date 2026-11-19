/**
 * Estado de envío de un mensaje SMS.
 * Enum plano: son 3 códigos fijos sin comportamiento propio, envolverlos en una
 * clase/value-object sería ceremonia sin beneficio real (ver docs/ARCHITECTURE.md).
 */

// En base de datos estos códigos están normalizados (3FN) en el catálogo `estado_envio`,
// y `mensaje.estadoEnvio` es FK hacia él (ver la migración 20260101000004). El catálogo
// debe mantenerse idéntico a este enum: lo verifica tests/unit/infrastructure.
export enum EstadoEnvio {
  PENDIENTE = 1,
  ENVIADO = 2,
  ERROR = 3,
}

const ESTADO_ENVIO_LABEL: Record<EstadoEnvio, string> = {
  [EstadoEnvio.PENDIENTE]: 'Pendiente',
  [EstadoEnvio.ENVIADO]: 'Enviado',
  [EstadoEnvio.ERROR]: 'Error',
};

export function estadoEnvioLabel(estado: EstadoEnvio): string {
  return ESTADO_ENVIO_LABEL[estado];
}

/** Orden canónico en el que se presentan los estados en el reporte. */
export const ESTADOS_ENVIO_ORDENADOS: readonly EstadoEnvio[] = [
  EstadoEnvio.PENDIENTE,
  EstadoEnvio.ENVIADO,
  EstadoEnvio.ERROR,
];
