/** DTO de salida de `POST /v1/campaigns`.
 * Contrato HTTP: ver docs/openapi.yaml. */
export interface MensajeResponse {
  idMensaje: number;
  mensaje: string;
  fechaHoraEnvio: string; // ISO 8601
  estadoEnvio: number;
  estado: 0 | 1;
}

export interface CampaniaResponse {
  idCampania: number;
  nombre: string;
  idUsuario: number;
  fechaHoraProgramacion: string; // ISO 8601
  estado: 0 | 1;
  mensajes: MensajeResponse[];
}
