import { Periodo } from '@domain';
import type { ReporteMensajesRequest } from '../dto';

/** DTO de entrada → parámetros de dominio del caso de uso. */
export const ReporteMensajesRequestMapper = {
  toDomain(request: ReporteMensajesRequest): { periodo: Periodo; idCliente?: number } {
    return { periodo: Periodo.fromYyyyMm(request.mes), idCliente: request.idCliente };
  },
};
