import type { Campania } from '../../entities/campania';

/**
 * Puerto de SALIDA (driven port): repositorio del agregado `Campania` (raíz) con
 * sus mensajes. El dominio define el contrato; un adaptador de infraestructura lo
 * implementa (ver `CampaniaPersistenceAdapter`).
 */
export interface CampaniaRepository {
  /**
   * Persiste la campaña y TODOS sus mensajes de forma atómica (todo o nada) y
   * devuelve la campaña persistida, con los IDs generados.
   */
  save(campania: Campania): Promise<Campania>;
}
