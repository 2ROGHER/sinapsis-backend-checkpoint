/**
 * Entidad de dominio Cliente.
 * Representa a un cliente de Sinapsis que programa campañas de marketing SMS.
 */
export interface ClienteProps {
  idCliente: number;
  nombre: string;
  estado: 0 | 1;
}

export class Cliente {
  private constructor(private readonly props: ClienteProps) {}

  static fromProps(props: ClienteProps): Cliente {
    return new Cliente(props);
  }

  // getters
  get idCliente(): number {
    return this.props.idCliente;
  }

  get nombre(): string {
    return this.props.nombre;
  }

  get estado(): 0 | 1 {
    return this.props.estado;
  }

  estaActivo(): boolean {
    return this.props.estado === 1;
  }
}
