import { PeriodoInvalidoError } from '../entities/errors';

const FORMATO_YYYY_MM = /^(\d{4})-(0[1-9]|1[0-2])$/;

/**
 * Value Object que representa un mes calendario (p. ej. "2026-11") como un rango
 * semi-abierto [inicio, finExclusivo) en UTC.
 *
 * Por qué UTC y no hora local: la máquina de desarrollo (Windows) y el runtime de
 * Lambda pueden tener zonas horarias distintas (y Lambda, por defecto, corre en
 * UTC). Si el rango se calculara con el constructor local de `Date`, el mismo
 * "2026-11" produciría límites distintos según dónde se ejecute el código —  un
 * bug sutil y difícil de reproducir. Fijar explícitamente UTC lo hace determinista
 * en cualquier entorno.
 *
 * Por qué rango semi-abierto y no `MONTH()/YEAR()` en SQL: aplicar una función
 * sobre la columna indexada (`fechaHoraEnvio`) impide que MySQL use el índice
 * `idx_mensaje_estado_fecha`. Comparar contra un rango (`>= inicio AND < finExclusivo`)
 * sí puede usarlo.
 */
export class Periodo {
  private constructor(
    private readonly _mes: string,
    private readonly _inicio: Date,
    private readonly _finExclusivo: Date,
  ) {}

  static fromYyyyMm(mes: string): Periodo {
    const match = FORMATO_YYYY_MM.exec(mes);
    if (!match) {
      throw new PeriodoInvalidoError(mes);
    }

    const anio = Number(match[1]);
    const mesNumero = Number(match[2]); // 1-12

    // Date.UTC con mes=12 (índice 0-based 12) produce automáticamente el 1 de enero
    // del año siguiente: el rollover de fin de año queda resuelto por el propio
    // motor de Date, sin lógica condicional adicional.
    const inicio = new Date(Date.UTC(anio, mesNumero - 1, 1, 0, 0, 0, 0));
    const finExclusivo = new Date(Date.UTC(anio, mesNumero, 1, 0, 0, 0, 0));

    return new Periodo(mes, inicio, finExclusivo);
  }

  get mes(): string {
    return this._mes;
  }

  get inicio(): Date {
    return this._inicio;
  }

  get finExclusivo(): Date {
    return this._finExclusivo;
  }

  /** Utilidad pura, usada en tests: ¿la fecha cae dentro de este periodo? */
  incluye(fecha: Date): boolean {
    return fecha >= this._inicio && fecha < this._finExclusivo;
  }
}
