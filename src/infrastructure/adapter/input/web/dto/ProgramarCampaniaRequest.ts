import { z } from 'zod';

/**
 * DTO de entrada de `POST /v1/campaigns`. Valida SOLO forma/sintaxis en el borde
 * HTTP; las reglas de negocio (límite de 160 caracteres, nombre válido...) las
 * aplica el dominio al construir las entidades en `CampaniaRequestMapper`.
 */
const mensajeRequestSchema = z.object({
  mensaje: z
    .string({ required_error: "Cada mensaje requiere el campo 'mensaje'" })
    .min(1, 'El texto del mensaje no puede estar vacío')
    .max(160, 'El texto del mensaje no puede superar 160 caracteres'),
  fechaHoraEnvio: z.coerce.date({
    invalid_type_error: "'fechaHoraEnvio' debe ser una fecha ISO 8601 válida",
    required_error: "Cada mensaje requiere el campo 'fechaHoraEnvio'",
  }),
});

export const programarCampaniaRequestSchema = z.object({
  idUsuario: z.coerce.number({ required_error: "'idUsuario' es obligatorio" }).int().positive(),
  nombre: z
    .string({ required_error: "'nombre' es obligatorio" })
    .min(1, "'nombre' no puede estar vacío")
    .max(200, "'nombre' no puede superar 200 caracteres"),
  fechaHoraProgramacion: z.coerce.date({
    invalid_type_error: "'fechaHoraProgramacion' debe ser una fecha ISO 8601 válida",
    required_error: "'fechaHoraProgramacion' es obligatorio",
  }),
  mensajes: z.array(mensajeRequestSchema).min(1, "'mensajes' debe incluir al menos un mensaje"),
});

export type ProgramarCampaniaRequest = z.infer<typeof programarCampaniaRequestSchema>;
