import { ESTADOS_ENVIO_ORDENADOS, estadoEnvioLabel } from '@domain';
import { ESTADOS_ENVIO_CATALOGO } from '@infrastructure/adapter/output/persistence/database/migrations/20260101000004_create_estado_envio_table';

/**
 * El catálogo `estado_envio` (BD) y el enum `EstadoEnvio` (dominio) son dos
 * representaciones de lo mismo. Si alguien agrega o renombra un estado en un solo
 * lado, la FK de `mensaje.estadoEnvio` y el reporte quedarían desalineados: este
 * test lo detecta sin necesitar una base de datos.
 */
describe('Catálogo estado_envio ↔ enum EstadoEnvio', () => {
  it('tiene los mismos códigos y etiquetas que el dominio, en el mismo orden', () => {
    const delDominio = ESTADOS_ENVIO_ORDENADOS.map((id) => ({
      idEstadoEnvio: id,
      nombre: estadoEnvioLabel(id),
    }));

    expect(ESTADOS_ENVIO_CATALOGO).toEqual(delDominio);
  });
});
