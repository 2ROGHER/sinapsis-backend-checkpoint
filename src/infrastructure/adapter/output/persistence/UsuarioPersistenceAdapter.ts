import type { Knex } from 'knex';
import type { Usuario, UsuarioRepository } from '@domain';
import type { UsuarioEntity } from './entity';
import { UsuarioMapper } from './mapper';

/** Adaptador secundario (MySQL/Knex) que implementa el puerto de salida `UsuarioRepository`. */
export class UsuarioPersistenceAdapter implements UsuarioRepository {
  constructor(private readonly knex: Knex) {}

  async findById(idUsuario: number): Promise<Usuario | null> {
    const entity = await this.knex<UsuarioEntity>('usuario').where({ idUsuario }).first();
    return entity ? UsuarioMapper.toDomain(entity) : null;
  }
}
