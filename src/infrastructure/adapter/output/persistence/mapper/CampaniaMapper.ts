import { Campania, type Mensaje } from '@domain';
import type { CampaniaEntity } from '../entity';

export const CampaniaMapper = {
  /** Dominio → fila a insertar (el `idCampania` lo genera MySQL, por eso se omite). */
  toEntity(campania: Campania): Omit<CampaniaEntity, 'idCampania'> {
    return {
      idUsuario: campania.idUsuario,
      nombre: campania.nombre,
      fechaHoraProgramacion: campania.fechaHoraProgramacion,
      estado: campania.estado,
    };
  },

  toDomain(entity: CampaniaEntity, mensajes: Mensaje[]): Campania {
    return Campania.fromProps(
      {
        idCampania: entity.idCampania,
        idUsuario: entity.idUsuario,
        nombre: entity.nombre,
        fechaHoraProgramacion: new Date(entity.fechaHoraProgramacion),
        estado: entity.estado,
      },
      mensajes,
    );
  },
};
