import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '@infrastructure/adapter/input/web';
import { buildUseCases } from '@infrastructure/configuration';
import {
  InMemoryClienteRepository,
  InMemoryUsuarioRepository,
  InMemoryCampaniaRepository,
  InMemoryMensajesReportQuery,
} from '../unit/mocks';

const USUARIOS_SEED = [
  { idUsuario: 1, idCliente: 1, usuario: 'aperez', estado: 1 as const },
  { idUsuario: 4, idCliente: 2, usuario: 'rsilva', estado: 0 as const },
];

function buildTestApp(): Express {
  const useCases = buildUseCases({
    clienteRepository: new InMemoryClienteRepository(),
    usuarioRepository: new InMemoryUsuarioRepository(USUARIOS_SEED),
    campaniaRepository: new InMemoryCampaniaRepository(),
    mensajesReportQuery: new InMemoryMensajesReportQuery(),
  });
  return createApp(useCases);
}

const PAYLOAD_VALIDO = {
  idUsuario: 1,
  nombre: 'Promo Black Friday 2026',
  fechaHoraProgramacion: '2026-11-20T09:00:00.000Z',
  mensajes: [
    {
      mensaje: '¡Black Friday llegó! 50% OFF en toda la tienda',
      fechaHoraEnvio: '2026-11-20T09:05:00.000Z',
    },
    {
      mensaje: 'Últimas horas de Black Friday, no te lo pierdas',
      fechaHoraEnvio: '2026-11-20T18:00:00.000Z',
    },
  ],
};

describe('POST /v1/campaigns', () => {
  it('caso 1: 201 con la campaña y sus mensajes creados', async () => {
    const response = await request(buildTestApp()).post('/v1/campaigns').send(PAYLOAD_VALIDO);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ nombre: PAYLOAD_VALIDO.nombre, idUsuario: 1, estado: 1 });
    expect(response.body.idCampania).toEqual(expect.any(Number));
    expect(response.body.mensajes).toHaveLength(2);
    response.body.mensajes.forEach((m: { idMensaje: unknown; estadoEnvio: unknown }) => {
      expect(m.idMensaje).toEqual(expect.any(Number));
      expect(m.estadoEnvio).toBe(1);
    });
  });

  it('caso 2: 400 si falta un campo requerido (idUsuario)', async () => {
    const { idUsuario: _idUsuario, ...sinIdUsuario } = PAYLOAD_VALIDO;

    const response = await request(buildTestApp()).post('/v1/campaigns').send(sinIdUsuario);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('ValidationError');
  });

  it('caso 3: 400 si "mensajes" llega vacío', async () => {
    const response = await request(buildTestApp())
      .post('/v1/campaigns')
      .send({ ...PAYLOAD_VALIDO, mensajes: [] });

    expect(response.status).toBe(400);
  });

  it('caso 4: 400 si algún mensaje supera 160 caracteres', async () => {
    const response = await request(buildTestApp())
      .post('/v1/campaigns')
      .send({
        ...PAYLOAD_VALIDO,
        mensajes: [{ mensaje: 'a'.repeat(161), fechaHoraEnvio: '2026-11-20T09:05:00.000Z' }],
      });

    expect(response.status).toBe(400);
  });

  it('caso 5: 400 si una fecha no es ISO 8601 válida', async () => {
    const response = await request(buildTestApp())
      .post('/v1/campaigns')
      .send({ ...PAYLOAD_VALIDO, fechaHoraProgramacion: 'no-es-una-fecha' });

    expect(response.status).toBe(400);
  });

  it('caso 6: 404 USUARIO_NO_ENCONTRADO si idUsuario no existe', async () => {
    const response = await request(buildTestApp())
      .post('/v1/campaigns')
      .send({ ...PAYLOAD_VALIDO, idUsuario: 999 });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('USUARIO_NO_ENCONTRADO');
  });

  it('caso 7: 409 USUARIO_INACTIVO si idUsuario existe pero está inactivo', async () => {
    const response = await request(buildTestApp())
      .post('/v1/campaigns')
      .send({ ...PAYLOAD_VALIDO, idUsuario: 4 });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('USUARIO_INACTIVO');
  });

  it('caso 9: 400 si idUsuario no es de tipo numérico', async () => {
    const response = await request(buildTestApp())
      .post('/v1/campaigns')
      .send({ ...PAYLOAD_VALIDO, idUsuario: 'no-es-un-numero' });

    expect(response.status).toBe(400);
  });
});
