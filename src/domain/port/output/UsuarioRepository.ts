import type { Usuario } from '../../entities/usuario';

/** Puerto de SALIDA (driven port): consulta de usuarios. */
export interface UsuarioRepository {
  findById(idUsuario: number): Promise<Usuario | null>;
}
