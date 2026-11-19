import { Router } from 'express';
import type { ReporteUseCase } from '@domain';
import { ReporteController } from '../controller';
import { asyncHandler } from '../middleware';

export function reporteRoutes(reporteUseCase: ReporteUseCase): Router {
  const router = Router();
  const controller = new ReporteController(reporteUseCase);

  router.get('/reports/messages-by-status', asyncHandler(controller.mensajesPorEstado));

  return router;
}
