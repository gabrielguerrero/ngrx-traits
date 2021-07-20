import {
  LoadEntitiesKeyedConfig,
  LoadEntitiesMutators,
} from './load-entities.model';
import { PaginationKeyedConfig } from '../pagination';

export function createLoadEntitiesTraitMutators<Entity>(
  allConfigs: LoadEntitiesKeyedConfig<Entity> & PaginationKeyedConfig
) {
  const adapter = allConfigs?.loadEntities?.adapter;

  return {
    setAll: adapter?.setAll,
  } as LoadEntitiesMutators<Entity>;
}
