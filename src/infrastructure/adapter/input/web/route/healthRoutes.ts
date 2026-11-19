import { Router } from 'express';
import { asyncHandler } from '../middleware';
import { HealthController } from '../controller/HealthController';

export function healthRoutes(): Router {
  const router = Router();
  router.get('/health', asyncHandler(HealthController.check));
  return router;
}
