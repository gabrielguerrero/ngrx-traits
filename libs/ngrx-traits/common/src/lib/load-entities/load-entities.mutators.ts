import { EntitiesPaginationKeyedConfig } from '../entities-pagination';
import {
  LoadEntitiesKeyedConfig,
  LoadEntitiesMutators,
} from './load-entities.model';

export function createLoadEntitiesTraitMutators<Entity>(
  allConfigs: LoadEntitiesKeyedConfig<Entity> & EntitiesPaginationKeyedConfig,
) {
  const adapter = allConfigs?.loadEntities?.adapter;

  return {
    setEntitiesList: adapter?.setAll,
  } as LoadEntitiesMutators<Entity>;
}
