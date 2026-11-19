import { DomainError } from './DomainError';

// Ver nota de MensajeTextoInvalidoError.ts: literal repetido a propósito para no
// crear una dependencia circular Campania -> error -> Campania. Debe mantenerse en
// sync con `CAMPANIA_NOMBRE_MAX_LENGTH` en ../campania/Campania.ts y con la columna
// `nombre varchar(200)` del esquema MySQL.
const CAMPANIA_NOMBRE_MAX_LENGTH = 200;

export class NombreCampaniaInvalidoError extends DomainError {
  readonly code = 'NOMBRE_CAMPANIA_INVALIDO';

  constructor(longitud: number) {
    super(
      `El nombre de la campaña debe tener entre 1 y ${CAMPANIA_NOMBRE_MAX_LENGTH} caracteres (recibido: ${longitud})`,
    );
  }
}
