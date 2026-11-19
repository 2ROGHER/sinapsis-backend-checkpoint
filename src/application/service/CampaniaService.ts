import type { Campania, CampaniaRepository, CampaniaUseCase, UsuarioRepository } from '@domain';
import { UsuarioInactivoError, UsuarioNoEncontradoError } from '../errors';

/**
 * Servicio de aplicación: implementa el caso de uso `CampaniaUseCase` (puerto de
 * entrada) y orquesta el dominio usando únicamente puertos de salida.
 *
 * Se valida que el usuario exista y esté activo, pero NO se valida en cascada que
 * el cliente dueño de ese usuario también esté activo (fuera del alcance pedido).
 * Las invariantes de la campaña y de sus mensajes ya las aplicó el dominio al
 * construir la entidad (`Campania.crear`, `Mensaje.crearPendiente`).
 */
export class CampaniaService implements CampaniaUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly campaniaRepository: CampaniaRepository,
  ) {}

  async programar(campania: Campania): Promise<Campania> {
    const usuario = await this.usuarioRepository.findById(campania.idUsuario);

    if (!usuario) {
      throw new UsuarioNoEncontradoError(campania.idUsuario);
    }
    if (!usuario.estaActivo()) {
      throw new UsuarioInactivoError(campania.idUsuario);
    }

    return this.campaniaRepository.save(campania);
  }
}
