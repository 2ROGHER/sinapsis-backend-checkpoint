import { z } from 'zod';

/**
 * DTO de entrada (query string) de `GET /v1/reports/messages-by-status`. Valida
 * forma/sintaxis; que el cliente exista es regla del caso de uso y la validez
 * semántica del mes es del value object `Periodo`.
 */
export const reporteMensajesRequestSchema = z.object({
  mes: z
    .string({ required_error: "El parámetro 'mes' es obligatorio" })
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "El parámetro 'mes' debe tener formato YYYY-MM"),
  idCliente: z.coerce
    .number({ invalid_type_error: "El parámetro 'idCliente' debe ser numérico" })
    .int()
    .positive()
    .optional(),
});

export type ReporteMensajesRequest = z.infer<typeof reporteMensajesRequestSchema>;
