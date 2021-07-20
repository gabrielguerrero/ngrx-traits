import { PaginationMutators, PaginationSelectors } from './pagination.model';
import { LoadEntitiesKeyedConfig } from '../load-entities';
export declare function createPaginationTraitMutators<Entity>(
  allSelectors: PaginationSelectors<Entity>,
  allConfigs: LoadEntitiesKeyedConfig<Entity>
): PaginationMutators<Entity>;
