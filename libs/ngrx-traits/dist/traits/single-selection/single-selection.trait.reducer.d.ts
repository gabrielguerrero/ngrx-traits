import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
} from '../load-entities/load-entities.model';
import { SortActions, SortKeyedConfig } from '../sort/sort.model';
import {
  EntityAndSingleSelectionState,
  SingleSelectionActions,
  SingleSelectionKeyedConfig,
  SingleSelectionMutators,
} from './single-selection.model';
import { CrudActions } from '../crud/crud.model';
import {
  PaginationActions,
  PaginationKeyedConfig,
} from '../pagination/pagination.model';
import { FilterActions } from '../filter';
export declare function createSingleSelectionInitialState<Entity>(
  previousInitialState: any,
  allConfigs: SingleSelectionKeyedConfig
): EntityAndSingleSelectionState<Entity>;
export declare function createSingleSelectionTraitReducer<
  Entity,
  S extends EntityAndSingleSelectionState<Entity>
>(
  initialState: S,
  allActions: SingleSelectionActions &
    CrudActions<Entity> &
    SortActions<Entity> &
    PaginationActions &
    FilterActions<any> &
    LoadEntitiesActions<Entity>,
  allMutators: SingleSelectionMutators<Entity>,
  allConfigs: SingleSelectionKeyedConfig &
    LoadEntitiesKeyedConfig<Entity> &
    PaginationKeyedConfig &
    SortKeyedConfig<Entity>
): import('@ngrx/store').ActionReducer<S, import('@ngrx/store').Action>;
