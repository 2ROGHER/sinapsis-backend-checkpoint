import type { Cliente } from '../../entities/cliente';

/** Puerto de SALIDA (driven port): consulta de clientes. */
export interface ClienteRepository {
  findById(idCliente: number): Promise<Cliente | null>;
}
