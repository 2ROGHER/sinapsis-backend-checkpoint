import { Cliente } from '@domain';
import type { ClienteEntity } from '../entity';

/** Modelo de persistencia ↔ entidad de dominio: evita que el esquema SQL contamine el dominio. */
export const ClienteMapper = {
  toDomain(entity: ClienteEntity): Cliente {
    return Cliente.fromProps({
      idCliente: entity.idCliente,
      nombre: entity.nombre,
      estado: entity.estado,
    });
  },
};
