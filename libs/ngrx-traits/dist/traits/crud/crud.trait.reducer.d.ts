import { FilterActions, FilterKeyedConfig } from '../filter/filter.model';
import {
  CrudActions,
  CrudKeyedConfig,
  CrudMutators,
  EntityAndCrudState,
} from './crud.model';
import { LoadEntitiesActions, LoadEntitiesKeyedConfig } from '../load-entities';
import { SortActions, SortKeyedConfig } from '../sort';
import { PaginationActions, PaginationKeyedConfig } from '../pagination';
export declare function createCrudInitialState<Entity>(
  previousInitialState: any
): EntityAndCrudState<Entity>;
export declare function createCrudTraitReducer<
  Entity,
  S extends EntityAndCrudState<Entity>
>(
  initialState: S,
  allActions: CrudActions<Entity> &
    LoadEntitiesActions<Entity> &
    SortActions<Entity> &
    FilterActions<any> &
    PaginationActions,
  allMutators: CrudMutators<Entity>,
  allConfigs: CrudKeyedConfig &
    FilterKeyedConfig<Entity, unknown> &
    LoadEntitiesKeyedConfig<Entity> &
    SortKeyedConfig<Entity> &
    PaginationKeyedConfig
): import('@ngrx/store').ActionReducer<S, import('@ngrx/store').Action>;
