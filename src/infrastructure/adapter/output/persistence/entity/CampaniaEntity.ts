/** Modelo de persistencia: fila de la tabla `campania`. NO es la entidad de dominio. */
// Esto es sumamente importante, dado que, en este caso no se esta usando un ORM
// para poder replicar la abstraccion de realizar consultas en la base con la base de datos.
export interface CampaniaEntity {
  idCampania: number;
  idUsuario: number;
  nombre: string;
  fechaHoraProgramacion: Date;
  estado: 0 | 1;
}
