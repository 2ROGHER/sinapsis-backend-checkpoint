import type { Knex } from 'knex';
import type { Campania, CampaniaRepository, Mensaje } from '@domain';
import type { CampaniaEntity, MensajeEntity } from './entity';
import { CampaniaMapper, MensajeMapper } from './mapper';

/**
 * Adaptador secundario (MySQL/Knex) que implementa el puerto de salida
 * `CampaniaRepository`. Encapsula la única operación transaccional multi-entidad
 * del sistema (campaña + N mensajes): con un solo caso de uso transaccional,
 * `knex.transaction()` aquí es suficiente y evita un Unit-of-Work genérico
 * (ver docs/ARCHITECTURE.md).
 */
export class CampaniaPersistenceAdapter implements CampaniaRepository {
  constructor(private readonly knex: Knex) {}

  async save(campania: Campania): Promise<Campania> {
    return this.knex.transaction(async (trx) => {
      // 1. Dominio → modelo de persistencia, e INSERT de la campaña
      const campaniaEntity = CampaniaMapper.toEntity(campania);
      const [idCampania] = await trx<CampaniaEntity>('campania').insert(campaniaEntity);
      if (idCampania === undefined) {
        // No debería ocurrir con AUTO_INCREMENT: sería un bug de infraestructura.
        throw new Error('MySQL no devolvió un idCampania tras el INSERT');
      }

      // 2. INSERT de cada mensaje en la misma transacción. Inserts individuales (no
      // bulk): con lotes pequeños el costo de N round-trips es despreciable y evita
      // depender de que un INSERT multi-fila asigne IDs estrictamente consecutivos.
      const mensajes: Mensaje[] = [];

      for (const mensaje of campania.mensajes) {
        const mensajeEntity = MensajeMapper.toEntity(mensaje, idCampania);
        const [idMensaje] = await trx<MensajeEntity>('mensaje').insert(mensajeEntity);
        if (idMensaje === undefined) {
          throw new Error('MySQL no devolvió un idMensaje tras el INSERT');
        }
        mensajes.push(MensajeMapper.toDomain({ idMensaje, ...mensajeEntity }));
      }

      // 3. Modelo de persistencia → dominio, ya con los IDs generados
      return CampaniaMapper.toDomain({ idCampania, ...campaniaEntity }, mensajes);
    });
  }
}
