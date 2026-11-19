import type { Mensaje } from '../../entities/mensaje';
import { NombreCampaniaInvalidoError, CampaniaSinMensajesError } from '../errors';

export const CAMPANIA_NOMBRE_MAX_LENGTH = 200;

export interface CampaniaProps {
  idCampania?: number; // ausente hasta persistir
  idUsuario: number;
  nombre: string;
  fechaHoraProgramacion: Date;
  estado: 0 | 1;
}

/**
 * Entidad de dominio Campania (raíz de agregado): agrupa los mensajes que la
 * componen. La atomicidad de "campaña + sus mensajes" se garantiza en la capa de
 * persistencia (CampaniaPersistenceAdapter.save), no en el dominio: el
 * dominio solo modela el agregado, no la mecánica transaccional de guardarlo.
 */
export class Campania {
  private constructor(
    private readonly props: CampaniaProps,
    private readonly _mensajes: Mensaje[],
  ) {}

  // Logica de negocio
  // Esta logica de negocio, permite crear una campaña conjuntamente con sus mensajes adjuntos
  static crear(input: {
    idUsuario: number;
    nombre: string;
    fechaHoraProgramacion: Date;
    mensajes: Mensaje[];
  }): Campania {
    const nombre = input.nombre.trim();

    if (nombre.length === 0 || nombre.length > CAMPANIA_NOMBRE_MAX_LENGTH) {
      throw new NombreCampaniaInvalidoError(nombre.length);
    }

    if (input.mensajes.length === 0) {
      throw new CampaniaSinMensajesError();
    }

    return new Campania(
      {
        idUsuario: input.idUsuario,
        nombre,
        fechaHoraProgramacion: input.fechaHoraProgramacion,
        estado: 1,
      },
      input.mensajes,
    );
  }

  static fromProps(
    props: Required<Pick<CampaniaProps, 'idCampania'>> & CampaniaProps,
    mensajes: Mensaje[],
  ): Campania {
    return new Campania(props, mensajes);
  }

  // getters
  get idCampania(): number | undefined {
    return this.props.idCampania;
  }

  get idUsuario(): number {
    return this.props.idUsuario;
  }

  get nombre(): string {
    return this.props.nombre;
  }

  get fechaHoraProgramacion(): Date {
    return this.props.fechaHoraProgramacion;
  }

  get estado(): 0 | 1 {
    return this.props.estado;
  }

  get mensajes(): readonly Mensaje[] {
    return this._mensajes;
  }

  // TODO: Implementar hashing para listas grandes o catalogs grandes mejor performance
}
