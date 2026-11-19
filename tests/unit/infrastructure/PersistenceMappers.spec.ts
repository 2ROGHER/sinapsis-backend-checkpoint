import { Campania, EstadoEnvio, Mensaje } from '@domain';
import {
  CampaniaMapper,
  ClienteMapper,
  MensajeMapper,
  ReporteMensajesMapper,
  UsuarioMapper,
} from '@infrastructure/adapter/output/persistence/mapper';

const FECHA = new Date('2026-11-20T09:05:00.000Z');

describe('Mappers de persistencia (entidad SQL ↔ dominio)', () => {
  it('CampaniaMapper.toEntity omite el id (lo genera MySQL) y copia los campos de la fila', () => {
    const campania = Campania.crear({
      idUsuario: 1,
      nombre: '  Promo  ',
      fechaHoraProgramacion: FECHA,
      mensajes: [Mensaje.crearPendiente({ mensaje: 'Hola', fechaHoraEnvio: FECHA })],
    });

    expect(CampaniaMapper.toEntity(campania)).toEqual({
      idUsuario: 1,
      nombre: 'Promo',
      fechaHoraProgramacion: FECHA,
      estado: 1,
    });
  });

  it('MensajeMapper.toEntity asigna el idCampania recibido y omite idMensaje', () => {
    const mensaje = Mensaje.crearPendiente({ mensaje: 'Hola', fechaHoraEnvio: FECHA });

    expect(MensajeMapper.toEntity(mensaje, 9)).toEqual({
      idCampania: 9,
      mensaje: 'Hola',
      fechaHoraEnvio: FECHA,
      estadoEnvio: EstadoEnvio.PENDIENTE,
      estado: 1,
    });
  });

  it('CampaniaMapper/MensajeMapper.toDomain reconstruyen la campaña persistida con sus ids', () => {
    const mensaje = MensajeMapper.toDomain({
      idMensaje: 11,
      idCampania: 9,
      mensaje: 'Hola',
      fechaHoraEnvio: FECHA,
      estadoEnvio: EstadoEnvio.PENDIENTE,
      estado: 1,
    });
    const campania = CampaniaMapper.toDomain(
      { idCampania: 9, idUsuario: 1, nombre: 'Promo', fechaHoraProgramacion: FECHA, estado: 1 },
      [mensaje],
    );

    expect(campania.idCampania).toBe(9);
    expect(campania.mensajes[0]?.idMensaje).toBe(11);
  });

  it('ClienteMapper y UsuarioMapper reconstruyen la entidad de dominio', () => {
    const cliente = ClienteMapper.toDomain({ idCliente: 1, nombre: 'ACME', estado: 1 });
    const usuario = UsuarioMapper.toDomain({
      idUsuario: 4,
      idCliente: 2,
      usuario: 'rsilva',
      estado: 0,
    });

    expect(cliente.idCliente).toBe(1);
    expect(usuario.estaActivo()).toBe(false);
  });

  it('ReporteMensajesMapper normaliza cantidad (string de MySQL → number) y suma el total', () => {
    const reporte = ReporteMensajesMapper.toDomain([
      { estadoEnvio: EstadoEnvio.PENDIENTE, cantidad: '2' },
      { estadoEnvio: EstadoEnvio.ENVIADO, cantidad: 3 },
    ]);

    expect(reporte).toEqual({
      conteos: [
        { estadoEnvio: EstadoEnvio.PENDIENTE, cantidad: 2 },
        { estadoEnvio: EstadoEnvio.ENVIADO, cantidad: 3 },
      ],
      total: 5,
    });
  });
});
