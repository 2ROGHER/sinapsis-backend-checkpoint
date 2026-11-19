import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Express 4 (a diferencia de Express 5) NO captura automáticamente los rechazos
 * de promesas lanzados dentro de un handler `async`: si no se reenvían a `next()`
 * explícitamente, la petición queda colgada y el error nunca llega al
 * `errorHandler` centralizado. Este wrapper es el puente necesario.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
