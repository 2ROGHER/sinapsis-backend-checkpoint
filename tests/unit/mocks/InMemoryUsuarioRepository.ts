import { Usuario, type UsuarioProps } from '@domain';
import type { UsuarioRepository } from '@domain';

export class InMemoryUsuarioRepository implements UsuarioRepository {
  private readonly usuarios: Map<number, Usuario>;

  constructor(seed: UsuarioProps[] = []) {
    this.usuarios = new Map(seed.map((props) => [props.idUsuario, Usuario.fromProps(props)]));
  }

  async findById(idUsuario: number): Promise<Usuario | null> {
    return this.usuarios.get(idUsuario) ?? null;
  }
}
