import type { Request, Response } from 'express';
import type { CampaniaUseCase } from '@domain';
import { programarCampaniaRequestSchema } from '../dto';
import { CampaniaRequestMapper, CampaniaResponseMapper } from '../mapper';

/**
 * Adaptador primario: traduce HTTP ↔ dominio. Depende del puerto de entrada
 * `CampaniaUseCase`, nunca de la clase del servicio. Sin lógica de negocio.
 */
export class CampaniaController {
  constructor(private readonly campaniaUseCase: CampaniaUseCase) {}

  programar = async (req: Request, res: Response): Promise<void> => {
    // 1. Validar la forma del request (zod) y mapearlo a la entidad de dominio
    const request = programarCampaniaRequestSchema.parse(req.body);
    const campania = CampaniaRequestMapper.toDomain(request);

    // 2. Ejecutar el caso de uso
    const programada = await this.campaniaUseCase.programar(campania);

    // 3. Mapear a la respuesta con el status correcto (201 Created)
    res.status(201).json(CampaniaResponseMapper.from(programada));
  };
}
