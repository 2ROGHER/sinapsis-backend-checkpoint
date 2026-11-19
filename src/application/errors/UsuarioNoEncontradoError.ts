import { ResourceNotFoundError } from './ApplicationError';

export class UsuarioNoEncontradoError extends ResourceNotFoundError {
  readonly code = 'USUARIO_NO_ENCONTRADO';

  constructor(idUsuario: number) {
    super(`No existe un usuario con idUsuario=${idUsuario}`);
  }
}
