import { ConflictError } from './ApplicationError';

export class UsuarioInactivoError extends ConflictError {
  readonly code = 'USUARIO_INACTIVO';

  constructor(idUsuario: number) {
    super(`El usuario idUsuario=${idUsuario} está inactivo y no puede programar campañas`);
  }
}
