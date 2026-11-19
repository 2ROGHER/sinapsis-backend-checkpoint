/** Modelo de persistencia: fila de la tabla `usuario`. */
export interface UsuarioEntity {
  idUsuario: number;
  idCliente: number;
  usuario: string;
  estado: 0 | 1;
}
