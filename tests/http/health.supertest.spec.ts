import request from 'supertest';
import { createApp } from '@infrastructure/adapter/input/web';
import { buildUseCases } from '@infrastructure/configuration';
import {
  InMemoryClienteRepository,
  InMemoryUsuarioRepository,
  InMemoryCampaniaRepository,
  InMemoryMensajesReportQuery,
} from '../unit/mocks';

function buildTestApp() {
  const useCases = buildUseCases({
    clienteRepository: new InMemoryClienteRepository(),
    usuarioRepository: new InMemoryUsuarioRepository(),
    campaniaRepository: new InMemoryCampaniaRepository(),
    mensajesReportQuery: new InMemoryMensajesReportQuery(),
  });
  return createApp(useCases);
}

describe('GET /v1/health', () => {
  it('responde 200 con { status: "ok" } sin tocar ningún repositorio', async () => {
    const app = buildTestApp();

    const response = await request(app).get('/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('responde 404 para una ruta no definida', async () => {
    const app = buildTestApp();

    const response = await request(app).get('/v1/ruta-inexistente');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('NotFound');
  });
});
