import {
  Campania,
  Mensaje,
  CAMPANIA_NOMBRE_MAX_LENGTH,
  NombreCampaniaInvalidoError,
  CampaniaSinMensajesError,
} from '@domain';

const mensaje = () =>
  Mensaje.crearPendiente({ mensaje: 'Hola', fechaHoraEnvio: new Date('2026-11-20T09:05:00Z') });

const crear = (overrides: { nombre?: string; mensajes?: Mensaje[] } = {}) =>
  Campania.crear({
    idUsuario: 1,
    nombre: overrides.nombre ?? 'Promo',
    fechaHoraProgramacion: new Date('2026-11-20T09:00:00Z'),
    mensajes: overrides.mensajes ?? [mensaje()],
  });

describe('Campania (invariantes de dominio)', () => {
  it('se crea activa y sin id (el id lo asigna la persistencia)', () => {
    const campania = crear({ nombre: '  Promo  ' });

    expect(campania.estado).toBe(1);
    expect(campania.idCampania).toBeUndefined();
    expect(campania.nombre).toBe('Promo'); // se normaliza (trim)
    expect(campania.mensajes).toHaveLength(1);
  });

  it('rechaza un nombre vacío', () => {
    expect(() => crear({ nombre: '   ' })).toThrow(NombreCampaniaInvalidoError);
  });

  it(`rechaza un nombre de más de ${CAMPANIA_NOMBRE_MAX_LENGTH} caracteres`, () => {
    expect(() => crear({ nombre: 'a'.repeat(CAMPANIA_NOMBRE_MAX_LENGTH + 1) })).toThrow(
      NombreCampaniaInvalidoError,
    );
  });

  it('rechaza una campaña sin mensajes', () => {
    expect(() => crear({ mensajes: [] })).toThrow(CampaniaSinMensajesError);
  });
});
