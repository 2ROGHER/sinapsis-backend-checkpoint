import { CampaniaService, UsuarioNoEncontradoError, UsuarioInactivoError } from '@application';
import { Campania, Mensaje } from '@domain';
import { InMemoryUsuarioRepository, InMemoryCampaniaRepository } from '../mocks';

const USUARIOS_SEED = [
  { idUsuario: 1, idCliente: 1, usuario: 'aperez', estado: 1 as const },
  { idUsuario: 4, idCliente: 2, usuario: 'rsilva', estado: 0 as const }, // inactivo
];

function buildService(options: { fallarAlGuardar?: boolean } = {}) {
  const usuarioRepository = new InMemoryUsuarioRepository(USUARIOS_SEED);
  const campaniaRepository = new InMemoryCampaniaRepository(options);
  return {
    service: new CampaniaService(usuarioRepository, campaniaRepository),
    usuarioRepository,
    campaniaRepository,
  };
}

/** El servicio recibe la entidad de dominio ya construida (el mapper HTTP la arma). */
function crearCampania(idUsuario = 1): Campania {
  return Campania.crear({
    idUsuario,
    nombre: 'Promo Black Friday 2026',
    fechaHoraProgramacion: new Date('2026-11-20T09:00:00.000Z'),
    mensajes: [
      Mensaje.crearPendiente({
        mensaje: '¡Black Friday llegó! 50% OFF en toda la tienda',
        fechaHoraEnvio: new Date('2026-11-20T09:05:00.000Z'),
      }),
      Mensaje.crearPendiente({
        mensaje: 'Últimas horas de Black Friday, no te lo pierdas',
        fechaHoraEnvio: new Date('2026-11-20T18:00:00.000Z'),
      }),
    ],
  });
}

describe('CampaniaService.programar', () => {
  it('caso 1: persiste la campaña con sus mensajes cuando el usuario existe y está activo', async () => {
    const { service, campaniaRepository } = buildService();

    const resultado = await service.programar(crearCampania());

    expect(resultado.idCampania).toBe(1);
    expect(resultado.idUsuario).toBe(1);
    expect(resultado.estado).toBe(1);
    expect(resultado.mensajes).toHaveLength(2);
    resultado.mensajes.forEach((m) => {
      expect(m.idMensaje).toEqual(expect.any(Number));
      expect(m.estadoEnvio).toBe(1); // Pendiente
      expect(m.estado).toBe(1);
    });
    expect(campaniaRepository.guardadas).toHaveLength(1);
  });

  it('caso 2: lanza UsuarioNoEncontradoError si idUsuario no existe, y no persiste', async () => {
    const { service, campaniaRepository } = buildService();

    await expect(service.programar(crearCampania(999))).rejects.toThrow(UsuarioNoEncontradoError);
    expect(campaniaRepository.guardadas).toHaveLength(0);
  });

  it('caso 3: lanza UsuarioInactivoError si idUsuario existe pero está inactivo, y no persiste', async () => {
    const { service, campaniaRepository } = buildService();

    await expect(service.programar(crearCampania(4))).rejects.toThrow(UsuarioInactivoError);
    expect(campaniaRepository.guardadas).toHaveLength(0);
  });

  it('caso 4: propaga el error del repositorio si la persistencia falla (sin intentar compensar)', async () => {
    const { service } = buildService({ fallarAlGuardar: true });

    await expect(service.programar(crearCampania())).rejects.toThrow(
      'Fallo simulado de persistencia',
    );
  });
});
