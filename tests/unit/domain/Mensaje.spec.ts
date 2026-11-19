import { Mensaje, MENSAJE_TEXTO_MAX_LENGTH, EstadoEnvio, MensajeTextoInvalidoError } from '@domain';

describe('Mensaje.crearPendiente (factory method)', () => {
  const fechaHoraEnvio = new Date('2026-11-20T09:05:00.000Z');

  it('crea un mensaje en estado Pendiente y activo', () => {
    const mensaje = Mensaje.crearPendiente({
      mensaje: 'Hola, este es un mensaje de prueba',
      fechaHoraEnvio,
    });

    expect(mensaje.estadoEnvio).toBe(EstadoEnvio.PENDIENTE);
    expect(mensaje.estado).toBe(1);
    expect(mensaje.mensaje).toBe('Hola, este es un mensaje de prueba');
    expect(mensaje.fechaHoraEnvio).toBe(fechaHoraEnvio);
    expect(mensaje.idMensaje).toBeUndefined();
  });

  it(`acepta un texto de exactamente ${MENSAJE_TEXTO_MAX_LENGTH} caracteres (límite inclusive)`, () => {
    const textoLimite = 'a'.repeat(MENSAJE_TEXTO_MAX_LENGTH);

    expect(() => Mensaje.crearPendiente({ mensaje: textoLimite, fechaHoraEnvio })).not.toThrow();
  });

  it(`rechaza un texto de ${MENSAJE_TEXTO_MAX_LENGTH + 1} caracteres`, () => {
    const textoExcedido = 'a'.repeat(MENSAJE_TEXTO_MAX_LENGTH + 1);

    expect(() => Mensaje.crearPendiente({ mensaje: textoExcedido, fechaHoraEnvio })).toThrow(
      MensajeTextoInvalidoError,
    );
  });

  it('rechaza un texto vacío', () => {
    expect(() => Mensaje.crearPendiente({ mensaje: '', fechaHoraEnvio })).toThrow(
      MensajeTextoInvalidoError,
    );
  });
});
