import type { Request, Response } from 'express';

/** Health check simple: no toca base de datos, solo confirma que el proceso responde. */
export const HealthController = {
  check: async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({ status: 'ok' });
  },
};
