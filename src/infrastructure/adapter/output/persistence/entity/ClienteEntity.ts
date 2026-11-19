/** Modelo de persistencia: fila de la tabla `cliente`. */
export interface ClienteEntity {
  idCliente: number;
  nombre: string;
  estado: 0 | 1;
}
