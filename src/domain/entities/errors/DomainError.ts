/**
 * Base de los errores de DOMINIO: violación de una regla de negocio (invariante de
 * una entidad o value object). Cada subclase declara un `code` estable. No conoce
 * HTTP: el middleware de infraestructura decide a qué status se traduce.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
