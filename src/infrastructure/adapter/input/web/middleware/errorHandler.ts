import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { DomainError } from '@domain';
import { ApplicationError, ConflictError, ResourceNotFoundError } from '@application';
import { logger } from '../../../../configuration';

/**
 * Único middleware de manejo de errores (equivalente al GlobalExceptionHandler).
 * Traduce cada categoría de error al status HTTP correspondiente; ni el dominio
 * ni la aplicación conocen HTTP.
 *
 *  - ZodError (forma inválida en el borde)       → 400
 *  - DomainError (regla de negocio violada)       → 400
 *  - ResourceNotFoundError (recurso inexistente)  → 404
 *  - ConflictError (choque con el estado actual)  → 409
 *  - Cualquier otro (bug / fallo de infra)        → 500, detalle solo en el log
 */
function resolveStatus(err: ApplicationError | DomainError): number {
  if (err instanceof ResourceNotFoundError) return 404;
  if (err instanceof ConflictError) return 409;
  return 400;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'ValidationError',
      message: 'La solicitud no cumple el formato esperado',
      details: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof DomainError || err instanceof ApplicationError) {
    res.status(resolveStatus(err)).json({ error: err.code, message: err.message });
    return;
  }

  logger.error('Error no controlado', {
    error: err instanceof Error ? (err.stack ?? err.message) : String(err),
    path: req.path,
    method: req.method,
  });
  res.status(500).json({ error: 'InternalServerError', message: 'Ocurrió un error inesperado' });
};
