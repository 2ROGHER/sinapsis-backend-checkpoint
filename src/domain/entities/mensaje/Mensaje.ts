import { EstadoEnvio } from './EstadoEnvio';
import { MensajeTextoInvalidoError } from '../errors';

export const MENSAJE_TEXTO_MAX_LENGTH = 160; // Validación importante. Estandar para mensajes de texto SMS

export interface MensajeProps {
  idMensaje?: number; // ausente hasta que se persiste (autoincremental)
  idCampania?: number; // se asigna al persistir la campaña dueña
  mensaje: string;
  fechaHoraEnvio: Date;
  estadoEnvio: EstadoEnvio;
  estado: 0 | 1;
}

/**
 * Entidad de dominio Mensaje: una pieza de SMS programada dentro de una campaña.
 * Invariante de negocio: el texto no puede superar los 160 caracteres (límite SMS
 * clásico de un único segmento, y el límite declarado por el propio modelo de datos
 * `mensaje varchar(160)`).
 */
export class Mensaje {
  private constructor(private readonly props: MensajeProps) {}

  // Lógica de negocio primero
  /**
   * Factory method que aplica el invariante de negocio y crea un mensaje en estado
   * inicial "Pendiente" + "Activo", tal como lo exige la regla de creación de campañas.
   */
  static crearPendiente(input: { mensaje: string; fechaHoraEnvio: Date }): Mensaje {
    if (input.mensaje.length === 0 || input.mensaje.length > MENSAJE_TEXTO_MAX_LENGTH) {
      throw new MensajeTextoInvalidoError(input.mensaje.length);
    }
    // Se crea una nueva salida de mensaje
    return new Mensaje({
      mensaje: input.mensaje,
      fechaHoraEnvio: input.fechaHoraEnvio,
      estadoEnvio: EstadoEnvio.PENDIENTE,
      estado: 1,
    });
  }

  /** Reconstrucción desde persistencia (ya validado en su momento, se confía en la fila). */
  static fromProps(
    props: Required<Pick<MensajeProps, 'idMensaje' | 'idCampania'>> & MensajeProps,
  ): Mensaje {
    return new Mensaje(props);
  }

  get idMensaje(): number | undefined {
    return this.props.idMensaje;
  }

  get idCampania(): number | undefined {
    return this.props.idCampania;
  }

  get mensaje(): string {
    return this.props.mensaje;
  }

  get fechaHoraEnvio(): Date {
    return this.props.fechaHoraEnvio;
  }

  get estadoEnvio(): EstadoEnvio {
    return this.props.estadoEnvio;
  }

  get estado(): 0 | 1 {
    return this.props.estado;
  }
}
