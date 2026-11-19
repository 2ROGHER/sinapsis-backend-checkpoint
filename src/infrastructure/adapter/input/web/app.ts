import express, { type Express } from 'express';
import type { UseCases } from '../../../configuration';
import { campaniaRoutes, healthRoutes, reporteRoutes } from './route';
import { errorHandler, notFoundHandler } from './middleware';

/**
 * Construye la app Express a partir de los casos de uso ya ensamblados (ver
 * configuration/composition-root.ts). Es el punto de entrada único tanto para
 * producción (lambda.ts, con repositorios MySQL) como para los tests Supertest
 * (con repositorios en memoria).
 */
export function createApp(useCases: UseCases): Express {
  const app = express();

  app.use(express.json());

  app.use('/v1', healthRoutes());
  app.use('/v1', reporteRoutes(useCases.reporteUseCase));
  app.use('/v1', campaniaRoutes(useCases.campaniaUseCase));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
