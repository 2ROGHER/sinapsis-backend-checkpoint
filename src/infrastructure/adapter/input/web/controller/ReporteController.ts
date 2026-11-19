import type { Request, Response } from 'express';
import type { ReporteUseCase } from '@domain';
import { reporteMensajesRequestSchema } from '../dto';
import { ReporteMensajesRequestMapper, ReporteMensajesResponseMapper } from '../mapper';

/** Adaptador primario del reporte de mensajes. Depende del puerto `ReporteUseCase`. */
export class ReporteController {
  constructor(private readonly reporteUseCase: ReporteUseCase) {}

  mensajesPorEstado = async (req: Request, res: Response): Promise<void> => {
    // schema.parse lanza ZodError si la query no cumple el contrato; asyncHandler
    // reenvía esa promesa rechazada al middleware de errores.
    const request = reporteMensajesRequestSchema.parse(req.query);
    const { periodo, idCliente } = ReporteMensajesRequestMapper.toDomain(request);

    const reporte = await this.reporteUseCase.generarReporteMensajes(periodo, idCliente);

    res.status(200).json(ReporteMensajesResponseMapper.from(reporte, periodo, idCliente));
  };
}
