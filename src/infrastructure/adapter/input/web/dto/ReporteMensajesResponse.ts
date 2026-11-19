/** DTO de salida de `GET /v1/reports/messages-by-status`. */
export interface ResumenEstadoResponse {
  estadoEnvio: number;
  estado: string; // etiqueta legible: "Pendiente" | "Enviado" | "Error"
  cantidad: number;
}

export interface ReporteMensajesResponse {
  mes: string;
  idCliente: number | null;
  resumen: ResumenEstadoResponse[];
  total: number;
}
