import type { Campania } from '../../entities/campania';

/**
 * Puerto de ENTRADA (driving port) de las campañas: catálogo de acciones que el
 * sistema ofrece sobre el agregado `Campania`.
 *
 * Es el contrato que usan los adaptadores primarios (HTTP, CLI, colas...). Lo
 * implementa la capa de aplicación (`CampaniaService`), nunca un adaptador.
 */
export interface CampaniaUseCase {
  /**
   * Programa una campaña con sus mensajes. Recibe la entidad de dominio ya
   * construida (sus invariantes se validan al crearla) y devuelve la campaña
   * persistida, con los IDs asignados.
   */
  programar(campania: Campania): Promise<Campania>;
}
