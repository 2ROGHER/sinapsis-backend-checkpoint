import type { EstadoEnvio } from '@domain';

/** Modelo de persistencia: fila de la tabla `mensaje`. */
export interface MensajeEntity {
  idMensaje: number;
  idCampania: number;
  mensaje: string;
  fechaHoraEnvio: Date;
  estadoEnvio: EstadoEnvio;
  estado: 0 | 1;
}
