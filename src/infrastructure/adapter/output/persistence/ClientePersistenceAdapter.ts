import type { Knex } from 'knex';
import type { Cliente, ClienteRepository } from '@domain';
import type { ClienteEntity } from './entity';
import { ClienteMapper } from './mapper';

/** Adaptador secundario (MySQL/Knex) que implementa el puerto de salida `ClienteRepository`. */
export class ClientePersistenceAdapter implements ClienteRepository {
  constructor(private readonly knex: Knex) {}

  async findById(idCliente: number): Promise<Cliente | null> {
    const entity = await this.knex<ClienteEntity>('cliente').where({ idCliente }).first();
    return entity ? ClienteMapper.toDomain(entity) : null;
  }
}
