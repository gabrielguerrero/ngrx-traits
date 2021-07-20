import {
  LoadEntitiesKeyedConfig,
  LoadEntitiesMutators,
} from './load-entities.model';
import { PaginationKeyedConfig } from '../pagination';
export declare function createLoadEntitiesTraitMutators<Entity>(
  allConfigs: LoadEntitiesKeyedConfig<Entity> & PaginationKeyedConfig
): LoadEntitiesMutators<Entity>;
