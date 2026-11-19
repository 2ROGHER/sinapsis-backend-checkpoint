import { DomainError } from './DomainError';

// Nota: el límite (160) se repite aquí como literal, en vez de importarlo desde
// Mensaje.ts, para evitar una dependencia circular entre la entidad y su propio
// error de validación (Mensaje -> error -> Mensaje). Debe mantenerse en sync con
// `MENSAJE_TEXTO_MAX_LENGTH` en ../mensaje/Mensaje.ts y con la columna
// `mensaje varchar(160)` del esquema MySQL.
const MENSAJE_TEXTO_MAX_LENGTH = 160;

export class MensajeTextoInvalidoError extends DomainError {
  readonly code = 'MENSAJE_TEXTO_INVALIDO';

  constructor(longitud: number) {
    super(
      `El texto del mensaje debe tener entre 1 y ${MENSAJE_TEXTO_MAX_LENGTH} caracteres (recibido: ${longitud})`,
    );
  }
}
