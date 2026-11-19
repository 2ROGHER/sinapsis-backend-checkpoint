/**
 * Base de los errores de APLICACIÓN: fallos de orquestación de un caso de uso
 * (recurso inexistente, conflicto de estado). Distintos de los `DomainError`, que
 * son violaciones de invariantes de las entidades. No conoce HTTP.
 */
export abstract class ApplicationError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** El recurso referenciado por el caso de uso no existe. */
export abstract class ResourceNotFoundError extends ApplicationError {}

/** La operación choca con el estado actual de un recurso. */
export abstract class ConflictError extends ApplicationError {}
