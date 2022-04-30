import {
  LoadEntitiesKeyedConfig,
  LoadEntitiesMutators,
} from './load-entities.model';
import { EntitiesPaginationKeyedConfig } from '../entities-pagination';

export function createLoadEntitiesTraitMutators<Entity>(
  allConfigs: LoadEntitiesKeyedConfig<Entity> & EntitiesPaginationKeyedConfig
) {
  const adapter = allConfigs?.loadEntities?.adapter;

  return {
    setEntitiesList: adapter?.setAll,
  } as LoadEntitiesMutators<Entity>;
}
