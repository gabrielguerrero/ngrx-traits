import {
  LoadEntitiesKeyedConfig,
  LoadEntitiesMutators,
} from './load-entities.model';
import { EntitiesPaginationKeyedConfig } from '../pagination';

export function createLoadEntitiesTraitMutators<Entity>(
  allConfigs: LoadEntitiesKeyedConfig<Entity> & EntitiesPaginationKeyedConfig
) {
  const adapter = allConfigs?.loadEntities?.adapter;

  return {
    setAll: adapter?.setAll,
  } as LoadEntitiesMutators<Entity>;
}
