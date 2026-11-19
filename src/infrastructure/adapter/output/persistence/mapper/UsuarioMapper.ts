import { Usuario } from '@domain';
import type { UsuarioEntity } from '../entity';

export const UsuarioMapper = {
  toDomain(entity: UsuarioEntity): Usuario {
    return Usuario.fromProps({
      idUsuario: entity.idUsuario,
      idCliente: entity.idCliente,
      usuario: entity.usuario,
      estado: entity.estado,
    });
  },
};
