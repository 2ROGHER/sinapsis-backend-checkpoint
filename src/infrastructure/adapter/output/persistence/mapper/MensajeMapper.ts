import { Mensaje } from '@domain';
import type { MensajeEntity } from '../entity';

export const MensajeMapper = {
  /** Dominio → fila a insertar (el `idMensaje` lo genera MySQL, por eso se omite). */
  toEntity(mensaje: Mensaje, idCampania: number): Omit<MensajeEntity, 'idMensaje'> {
    return {
      idCampania,
      mensaje: mensaje.mensaje,
      fechaHoraEnvio: mensaje.fechaHoraEnvio,
      estadoEnvio: mensaje.estadoEnvio,
      estado: mensaje.estado,
    };
  },

  toDomain(entity: MensajeEntity): Mensaje {
    return Mensaje.fromProps({
      idMensaje: entity.idMensaje,
      idCampania: entity.idCampania,
      mensaje: entity.mensaje,
      fechaHoraEnvio: new Date(entity.fechaHoraEnvio),
      estadoEnvio: entity.estadoEnvio,
      estado: entity.estado,
    });
  },
};
