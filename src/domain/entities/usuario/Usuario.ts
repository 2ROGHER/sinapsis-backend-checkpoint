/**
 * Entidad de dominio Usuario.
 * Un usuario pertenece a un cliente y es quien programa campañas en su nombre.
 */
export interface UsuarioProps {
  idUsuario: number;
  idCliente: number;
  usuario: string;
  estado: 0 | 1;
}

export class Usuario {
  private constructor(private readonly props: UsuarioProps) {}

  static fromProps(props: UsuarioProps): Usuario {
    return new Usuario(props);
  }

  // TODO: Implemetar la logica de negocio para la entidad mas adelante.
  // Validacion/constraints para la entidad de Usuarios

  //static validateUserName(): boolean{
  //return false;
  //}

  // getters
  get idUsuario(): number {
    return this.props.idUsuario;
  }

  get idCliente(): number {
    return this.props.idCliente;
  }

  get usuario(): string {
    return this.props.usuario;
  }

  get estado(): 0 | 1 {
    return this.props.estado;
  }

  estaActivo(): boolean {
    return this.props.estado === 1;
  }
}
