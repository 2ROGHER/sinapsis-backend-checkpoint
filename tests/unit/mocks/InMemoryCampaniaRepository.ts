import { Campania, Mensaje, type CampaniaRepository } from '@domain';

export class InMemoryCampaniaRepository implements CampaniaRepository {
  private nextCampaniaId = 1;
  private nextMensajeId = 1;
  readonly guardadas: Campania[] = [];

  constructor(private readonly options: { fallarAlGuardar?: boolean } = {}) {}

  async save(campania: Campania): Promise<Campania> {
    if (this.options.fallarAlGuardar) {
      // Simula un fallo de transacción en BD (p. ej. caída de conexión a mitad de
      // la operación), usado por el caso de prueba "500 - fallo de persistencia".
      throw new Error('Fallo simulado de persistencia (transacción)');
    }

    const idCampania = this.nextCampaniaId++;
    const mensajes = campania.mensajes.map((m) =>
      Mensaje.fromProps({
        idMensaje: this.nextMensajeId++,
        idCampania,
        mensaje: m.mensaje,
        fechaHoraEnvio: m.fechaHoraEnvio,
        estadoEnvio: m.estadoEnvio,
        estado: m.estado,
      }),
    );

    const guardada = Campania.fromProps(
      {
        idCampania,
        idUsuario: campania.idUsuario,
        nombre: campania.nombre,
        fechaHoraProgramacion: campania.fechaHoraProgramacion,
        estado: campania.estado,
      },
      mensajes,
    );

    this.guardadas.push(guardada);
    return guardada;
  }
}
