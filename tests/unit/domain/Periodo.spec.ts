import { Periodo, PeriodoInvalidoError } from '@domain';

describe('Periodo (value object)', () => {
  it('calcula el rango semi-abierto [inicio, finExclusivo) en UTC para un mes normal', () => {
    const periodo = Periodo.fromYyyyMm('2026-11');

    expect(periodo.inicio.toISOString()).toBe('2026-11-01T00:00:00.000Z');
    expect(periodo.finExclusivo.toISOString()).toBe('2026-12-01T00:00:00.000Z');
  });

  it('resuelve el cruce de año (diciembre -> enero del año siguiente) sin lógica condicional adicional', () => {
    const periodo = Periodo.fromYyyyMm('2026-12');

    expect(periodo.inicio.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(periodo.finExclusivo.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('conserva el string original del mes', () => {
    expect(Periodo.fromYyyyMm('2026-01').mes).toBe('2026-01');
  });

  it.each(['2026-13', '2026-00', '2026/11', 'nov-2026', '26-11', '', '2026-1', '2026-111'])(
    'rechaza formatos inválidos: "%s"',
    (valorInvalido) => {
      expect(() => Periodo.fromYyyyMm(valorInvalido)).toThrow(PeriodoInvalidoError);
    },
  );

  describe('incluye()', () => {
    const periodo = Periodo.fromYyyyMm('2026-11');

    it('incluye el primer instante del mes (límite inferior inclusivo)', () => {
      expect(periodo.incluye(new Date('2026-11-01T00:00:00.000Z'))).toBe(true);
    });

    it('incluye el último instante del mes', () => {
      expect(periodo.incluye(new Date('2026-11-30T23:59:59.999Z'))).toBe(true);
    });

    it('excluye el primer instante del mes siguiente (límite superior exclusivo)', () => {
      expect(periodo.incluye(new Date('2026-12-01T00:00:00.000Z'))).toBe(false);
    });

    it('excluye el último instante del mes anterior', () => {
      expect(periodo.incluye(new Date('2026-10-31T23:59:59.999Z'))).toBe(false);
    });
  });
});
