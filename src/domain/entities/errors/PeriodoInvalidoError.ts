import { DomainError } from './DomainError';

export class PeriodoInvalidoError extends DomainError {
  readonly code = 'PERIODO_INVALIDO';

  constructor(valorRecibido: string) {
    super(`El parámetro 'mes' debe tener formato YYYY-MM (recibido: "${valorRecibido}")`);
  }
}
