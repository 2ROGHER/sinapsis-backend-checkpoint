import { DomainError } from './DomainError';

export class CampaniaSinMensajesError extends DomainError {
  readonly code = 'CAMPANIA_SIN_MENSAJES';

  constructor() {
    super('Una campaña debe programarse con al menos un mensaje');
  }
}
