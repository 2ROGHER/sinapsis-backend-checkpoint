import { Campania, Mensaje } from '@domain';
import type { ProgramarCampaniaRequest } from '../dto';

/** DTO de entrada → entidad de dominio. Al construirla, el dominio aplica sus invariantes. */
export const CampaniaRequestMapper = {
  toDomain(request: ProgramarCampaniaRequest): Campania {
    return Campania.crear({
      idUsuario: request.idUsuario,
      nombre: request.nombre,
      fechaHoraProgramacion: request.fechaHoraProgramacion,
      mensajes: request.mensajes.map((m) =>
        Mensaje.crearPendiente({ mensaje: m.mensaje, fechaHoraEnvio: m.fechaHoraEnvio }),
      ),
    });
  },
};
