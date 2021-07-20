import { PaginationSelectors } from './pagination.model';
import { LoadEntitiesSelectors } from '../load-entities/load-entities.model';
import { FilterKeyedConfig } from '../filter/filter.model';
export declare function createPaginationTraitSelectors<Entity>(
  previousSelectors: LoadEntitiesSelectors<Entity>,
  allConfigs: FilterKeyedConfig<Entity, unknown>
): PaginationSelectors<Entity>;
