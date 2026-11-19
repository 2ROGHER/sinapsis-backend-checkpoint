import { Cliente, type ClienteProps } from '@domain';
import type { ClienteRepository } from '@domain';

/**
 * Mock manual (no jest.fn() sueltos) para que los tests de caso de uso sean
 * legibles y reutilizables entre specs, y para poder usarse también como
 * repositorio real (en memoria) en los tests Supertest vía buildContainer().
 */
export class InMemoryClienteRepository implements ClienteRepository {
  private readonly clientes: Map<number, Cliente>;

  constructor(seed: ClienteProps[] = []) {
    this.clientes = new Map(seed.map((props) => [props.idCliente, Cliente.fromProps(props)]));
  }

  async findById(idCliente: number): Promise<Cliente | null> {
    return this.clientes.get(idCliente) ?? null;
  }
}
