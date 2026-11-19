import {
  Campania,
  EstadoEnvio,
  Mensaje,
  MensajeTextoInvalidoError,
  Periodo,
  PeriodoInvalidoError,
} from '@domain';
import {
  CampaniaRequestMapper,
  CampaniaResponseMapper,
  ReporteMensajesRequestMapper,
  ReporteMensajesResponseMapper,
} from '@infrastructure/adapter/input/web/mapper';

const FECHA = new Date('2026-11-20T09:05:00.000Z');

describe('CampaniaRequestMapper (DTO → dominio)', () => {
  const request = {
    idUsuario: 1,
    nombre: 'Promo',
    fechaHoraProgramacion: new Date('2026-11-20T09:00:00.000Z'),
    mensajes: [{ mensaje: 'Hola', fechaHoraEnvio: FECHA }],
  };

  it('construye la campaña con mensajes Pendiente/Activo y sin ids', () => {
    const campania = CampaniaRequestMapper.toDomain(request);

    expect(campania.idCampania).toBeUndefined();
    expect(campania.idUsuario).toBe(1);
    expect(campania.mensajes).toHaveLength(1);
    expect(campania.mensajes[0]?.estadoEnvio).toBe(EstadoEnvio.PENDIENTE);
    expect(campania.mensajes[0]?.estado).toBe(1);
  });

  it('deja que el dominio rechace un texto de más de 160 caracteres', () => {
    const invalido = {
      ...request,
      mensajes: [{ mensaje: 'a'.repeat(161), fechaHoraEnvio: FECHA }],
    };

    expect(() => CampaniaRequestMapper.toDomain(invalido)).toThrow(MensajeTextoInvalidoError);
  });
});

describe('CampaniaResponseMapper (dominio → DTO)', () => {
  const persistida = Campania.fromProps(
    {
      idCampania: 7,
      idUsuario: 1,
      nombre: 'Promo',
      fechaHoraProgramacion: new Date('2026-11-20T09:00:00.000Z'),
      estado: 1,
    },
    [
      Mensaje.fromProps({
        idMensaje: 11,
        idCampania: 7,
        mensaje: 'Hola',
        fechaHoraEnvio: FECHA,
        estadoEnvio: EstadoEnvio.PENDIENTE,
        estado: 1,
      }),
    ],
  );

  it('serializa fechas a ISO 8601 y conserva ids y estados', () => {
    expect(CampaniaResponseMapper.from(persistida)).toEqual({
      idCampania: 7,
      nombre: 'Promo',
      idUsuario: 1,
      fechaHoraProgramacion: '2026-11-20T09:00:00.000Z',
      estado: 1,
      mensajes: [
        {
          idMensaje: 11,
          mensaje: 'Hola',
          fechaHoraEnvio: '2026-11-20T09:05:00.000Z',
          estadoEnvio: 1,
          estado: 1,
        },
      ],
    });
  });

  it('falla (bug de infraestructura) si la campaña llega sin idCampania', () => {
    const sinPersistir = Campania.crear({
      idUsuario: 1,
      nombre: 'Promo',
      fechaHoraProgramacion: FECHA,
      mensajes: [Mensaje.crearPendiente({ mensaje: 'Hola', fechaHoraEnvio: FECHA })],
    });

    expect(() => CampaniaResponseMapper.from(sinPersistir)).toThrow('idCampania');
  });
});

describe('ReporteMensajesRequestMapper / ReporteMensajesResponseMapper', () => {
  it('convierte mes + idCliente en un Periodo de dominio', () => {
    const { periodo, idCliente } = ReporteMensajesRequestMapper.toDomain({
      mes: '2026-11',
      idCliente: 3,
    });

    expect(periodo.mes).toBe('2026-11');
    expect(idCliente).toBe(3);
  });

  it('el dominio rechaza un mes semánticamente inválido', () => {
    expect(() => ReporteMensajesRequestMapper.toDomain({ mes: '2026-13' })).toThrow(
      PeriodoInvalidoError,
    );
  });

  it('agrega la etiqueta legible de cada estado y devuelve idCliente null sin filtro', () => {
    const respuesta = ReporteMensajesResponseMapper.from(
      {
        conteos: [
          { estadoEnvio: EstadoEnvio.PENDIENTE, cantidad: 2 },
          { estadoEnvio: EstadoEnvio.ENVIADO, cantidad: 0 },
          { estadoEnvio: EstadoEnvio.ERROR, cantidad: 1 },
        ],
        total: 3,
      },
      Periodo.fromYyyyMm('2026-11'),
    );

    expect(respuesta).toEqual({
      mes: '2026-11',
      idCliente: null,
      resumen: [
        { estadoEnvio: 1, estado: 'Pendiente', cantidad: 2 },
        { estadoEnvio: 2, estado: 'Enviado', cantidad: 0 },
        { estadoEnvio: 3, estado: 'Error', cantidad: 1 },
      ],
      total: 3,
    });
  });
});
