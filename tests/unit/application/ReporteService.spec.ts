import { ReporteService, ClienteNoEncontradoError } from '@application';
import { EstadoEnvio, Periodo, estadoEnvioLabel, type ReporteMensajesPorEstado } from '@domain';
import {
  InMemoryClienteRepository,
  InMemoryMensajesReportQuery,
  type MensajeSeedRow,
} from '../mocks';

const CLIENTES_SEED = [
  { idCliente: 1, nombre: 'Comercial Andina S.A.', estado: 1 as const },
  { idCliente: 2, nombre: 'Retail Pacífico Ltda.', estado: 1 as const },
];

const MENSAJES_NOVIEMBRE_2026: MensajeSeedRow[] = [
  {
    fechaHoraEnvio: new Date('2026-11-05T08:10:00Z'),
    estadoEnvio: EstadoEnvio.ENVIADO,
    estado: 1,
    idCliente: 1,
  },
  {
    fechaHoraEnvio: new Date('2026-11-06T08:10:00Z'),
    estadoEnvio: EstadoEnvio.PENDIENTE,
    estado: 1,
    idCliente: 1,
  },
  {
    fechaHoraEnvio: new Date('2026-11-20T09:05:00Z'),
    estadoEnvio: EstadoEnvio.ENVIADO,
    estado: 1,
    idCliente: 1,
  },
  {
    fechaHoraEnvio: new Date('2026-11-20T09:07:00Z'),
    estadoEnvio: EstadoEnvio.ERROR,
    estado: 1,
    idCliente: 1,
  },
  // mensaje inactivo: NO debe contarse
  {
    fechaHoraEnvio: new Date('2026-11-20T09:05:00Z'),
    estadoEnvio: EstadoEnvio.ENVIADO,
    estado: 0,
    idCliente: 1,
  },
  // mes distinto: NO debe contarse en el reporte de noviembre
  {
    fechaHoraEnvio: new Date('2026-10-01T09:05:00Z'),
    estadoEnvio: EstadoEnvio.ENVIADO,
    estado: 1,
    idCliente: 1,
  },
  // cliente distinto
  {
    fechaHoraEnvio: new Date('2026-11-10T09:05:00Z'),
    estadoEnvio: EstadoEnvio.PENDIENTE,
    estado: 1,
    idCliente: 2,
  },
];

const NOV_2026 = Periodo.fromYyyyMm('2026-11');

const cantidades = (reporte: ReporteMensajesPorEstado) =>
  Object.fromEntries(reporte.conteos.map((c) => [estadoEnvioLabel(c.estadoEnvio), c.cantidad]));

function buildService(mensajesSeed: MensajeSeedRow[] = MENSAJES_NOVIEMBRE_2026) {
  const clienteRepository = new InMemoryClienteRepository(CLIENTES_SEED);
  const mensajesReportQuery = new InMemoryMensajesReportQuery(mensajesSeed);
  return {
    service: new ReporteService(mensajesReportQuery, clienteRepository),
    clienteRepository,
    mensajesReportQuery,
  };
}

describe('ReporteService.generarReporteMensajes', () => {
  it('caso 1: reporta correctamente sin filtro de cliente (agrega todos los clientes)', async () => {
    const { service } = buildService();

    const resultado = await service.generarReporteMensajes(NOV_2026);

    expect(resultado.total).toBe(5); // 4 del cliente 1 (activos) + 1 del cliente 2
    expect(cantidades(resultado)).toEqual({ Pendiente: 2, Enviado: 2, Error: 1 });
  });

  it('caso 2: filtra correctamente por idCliente y lo propaga al repositorio de mensajes', async () => {
    const { service, mensajesReportQuery } = buildService();
    const spy = jest.spyOn(mensajesReportQuery, 'contarPorEstadoEnvio');

    const resultado = await service.generarReporteMensajes(NOV_2026, 1);

    expect(resultado.total).toBe(4);
    expect(cantidades(resultado)).toEqual({ Pendiente: 1, Enviado: 2, Error: 1 });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining(NOV_2026), 1);
  });

  it('caso 3: lanza ClienteNoEncontradoError si el idCliente no existe, y no llega a consultar mensajes', async () => {
    const { service, mensajesReportQuery } = buildService();
    const spy = jest.spyOn(mensajesReportQuery, 'contarPorEstadoEnvio');

    await expect(service.generarReporteMensajes(NOV_2026, 999)).rejects.toThrow(
      ClienteNoEncontradoError,
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('caso 4: no valida la existencia del cliente cuando idCliente no se envía', async () => {
    const { service, clienteRepository } = buildService();
    const spy = jest.spyOn(clienteRepository, 'findById');

    await service.generarReporteMensajes(NOV_2026);

    expect(spy).not.toHaveBeenCalled();
  });

  it('caso 5: un mes sin mensajes devuelve los 3 estados presentes en cantidad 0 y total 0', async () => {
    const { service } = buildService([]);

    const resultado = await service.generarReporteMensajes(Periodo.fromYyyyMm('2026-01'));

    expect(resultado.total).toBe(0);
    expect(resultado.conteos).toHaveLength(3);
    resultado.conteos.forEach((c) => expect(c.cantidad).toBe(0));
    expect(resultado.conteos.map((c) => estadoEnvioLabel(c.estadoEnvio))).toEqual([
      'Pendiente',
      'Enviado',
      'Error',
    ]);
  });
});
