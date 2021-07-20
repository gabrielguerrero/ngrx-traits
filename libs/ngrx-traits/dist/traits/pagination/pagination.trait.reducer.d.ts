import { FilterActions, FilterKeyedConfig } from '../filter/filter.model';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesMutators,
  LoadEntitiesSelectors,
} from '../load-entities/load-entities.model';
import {
  EntityAndPaginationState,
  PaginationKeyedConfig,
  PaginationMutators,
} from './pagination.model';
import { CrudActions } from '../crud';
import { ƟPaginationActions } from './pagination.model.internal';
export declare function createPaginationInitialState<Entity>(
  previousInitialState: any,
  allConfigs: PaginationKeyedConfig
): EntityAndPaginationState<Entity>;
export declare function createPaginationTraitReducer<
  Entity,
  S extends EntityAndPaginationState<Entity>
>(
  initialState: S,
  allActions: ƟPaginationActions &
    FilterActions<Entity> &
    LoadEntitiesActions<Entity> &
    CrudActions<Entity>,
  allSelectors: LoadEntitiesSelectors<Entity>,
  allMutators: PaginationMutators<Entity> & LoadEntitiesMutators<Entity>,
  allConfigs: FilterKeyedConfig<Entity, unknown> &
    LoadEntitiesKeyedConfig<Entity> &
    PaginationKeyedConfig
): import('@ngrx/store').ActionReducer<S, import('@ngrx/store').Action>;
