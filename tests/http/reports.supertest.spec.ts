import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '@infrastructure/adapter/input/web';
import { buildUseCases } from '@infrastructure/configuration';
import { EstadoEnvio, type MensajesReportQuery } from '@domain';
import {
  InMemoryClienteRepository,
  InMemoryUsuarioRepository,
  InMemoryCampaniaRepository,
  InMemoryMensajesReportQuery,
  type MensajeSeedRow,
} from '../unit/mocks';

const CLIENTES_SEED = [{ idCliente: 1, nombre: 'Comercial Andina S.A.', estado: 1 as const }];

const MENSAJES_SEED: MensajeSeedRow[] = [
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
];

function buildTestApp(
  mensajesReportQuery: MensajesReportQuery = new InMemoryMensajesReportQuery(MENSAJES_SEED),
): Express {
  const useCases = buildUseCases({
    clienteRepository: new InMemoryClienteRepository(CLIENTES_SEED),
    usuarioRepository: new InMemoryUsuarioRepository(),
    campaniaRepository: new InMemoryCampaniaRepository(),
    mensajesReportQuery,
  });
  return createApp(useCases);
}

describe('GET /v1/reports/messages-by-status', () => {
  it('caso 1: 200 con el resumen agregado cuando no se filtra por cliente', async () => {
    const response = await request(buildTestApp())
      .get('/v1/reports/messages-by-status')
      .query({ mes: '2026-11' });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toMatchObject({ mes: '2026-11', idCliente: null, total: 2 });
    expect(response.body.resumen).toHaveLength(3);
  });

  it('caso 3: 400 ValidationError si falta el parámetro "mes"', async () => {
    const response = await request(buildTestApp()).get('/v1/reports/messages-by-status');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('ValidationError');
  });

  it('caso 4: 400 si "mes" no cumple el formato YYYY-MM', async () => {
    const response = await request(buildTestApp())
      .get('/v1/reports/messages-by-status')
      .query({ mes: '2026-13' });

    expect(response.status).toBe(400);
  });

  it('caso 5: 400 si "idCliente" no es numérico', async () => {
    const response = await request(buildTestApp())
      .get('/v1/reports/messages-by-status')
      .query({ mes: '2026-11', idCliente: 'abc' });

    expect(response.status).toBe(400);
  });

  it('caso 6: 404 CLIENTE_NO_ENCONTRADO si el idCliente no existe', async () => {
    const response = await request(buildTestApp())
      .get('/v1/reports/messages-by-status')
      .query({ mes: '2026-11', idCliente: '999' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('CLIENTE_NO_ENCONTRADO');
  });

  it('caso 8: 500 InternalServerError genérico (sin fuga de stack trace) ante un fallo inesperado del repositorio', async () => {
    const mensajesReportQueryQueFalla: MensajesReportQuery = {
      contarPorEstadoEnvio: () => Promise.reject(new Error('fallo de conexión a BD simulado')),
    };

    const response = await request(buildTestApp(mensajesReportQueryQueFalla))
      .get('/v1/reports/messages-by-status')
      .query({ mes: '2026-11' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'InternalServerError',
      message: 'Ocurrió un error inesperado',
    });
    expect(JSON.stringify(response.body)).not.toContain('fallo de conexión a BD simulado');
  });
});
