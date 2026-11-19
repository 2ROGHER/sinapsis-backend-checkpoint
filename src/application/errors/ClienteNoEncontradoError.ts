import { ResourceNotFoundError } from './ApplicationError';

export class ClienteNoEncontradoError extends ResourceNotFoundError {
  readonly code = 'CLIENTE_NO_ENCONTRADO';

  constructor(idCliente: number) {
    super(`No existe un cliente con idCliente=${idCliente}`);
  }
}
