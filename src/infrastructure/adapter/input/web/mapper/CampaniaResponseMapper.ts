import type { Campania } from '@domain';
import type { CampaniaResponse } from '../dto';

/**
 * Los IDs son opcionales en el dominio hasta que se persiste. Si llegan aquí sin
 * valor, el adaptador de persistencia incumplió el contrato de `save`: es un bug
 * de infraestructura, no un error del cliente.
 */
function requireId(id: number | undefined, nombre: string): number {
  if (id === undefined) {
    throw new Error(`La campaña persistida no trae ${nombre}`);
  }
  return id;
}

/** Entidad de dominio (persistida) → DTO de salida. */
export const CampaniaResponseMapper = {
  from(campania: Campania): CampaniaResponse {
    return {
      idCampania: requireId(campania.idCampania, 'idCampania'),
      nombre: campania.nombre,
      idUsuario: campania.idUsuario,
      fechaHoraProgramacion: campania.fechaHoraProgramacion.toISOString(),
      estado: campania.estado,
      mensajes: campania.mensajes.map((m) => ({
        idMensaje: requireId(m.idMensaje, 'idMensaje'),
        mensaje: m.mensaje,
        fechaHoraEnvio: m.fechaHoraEnvio.toISOString(),
        estadoEnvio: m.estadoEnvio,
        estado: m.estado,
      })),
    };
  },
};
