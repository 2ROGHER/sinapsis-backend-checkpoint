import { Router } from 'express';
import type { CampaniaUseCase } from '@domain';
import { CampaniaController } from '../controller';
import { asyncHandler } from '../middleware';

export function campaniaRoutes(campaniaUseCase: CampaniaUseCase): Router {
  const router = Router();
  const controller = new CampaniaController(campaniaUseCase);

  router.post('/campaigns', asyncHandler(controller.programar));

  return router;
}
