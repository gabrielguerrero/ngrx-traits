import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
} from '../load-entities/load-entities.model';
import { SortActions, SortKeyedConfig } from '../sort/sort.model';
import {
  EntityAndMultipleSelectionState,
  MultipleSelectionMutators,
  MultiSelectActions,
} from './multi-selection.model';
import { CrudActions } from '../crud/crud.model';
import {
  PaginationActions,
  PaginationKeyedConfig,
} from '../pagination/pagination.model';
import { FilterActions } from '../filter';
export declare function createMultiSelectionInitialState<Entity>(
  previousInitialState: any
): EntityAndMultipleSelectionState<Entity>;
export declare function createMultiSelectionTraitReducer<
  Entity,
  S extends EntityAndMultipleSelectionState<Entity>
>(
  initialState: S,
  allActions: MultiSelectActions &
    CrudActions<Entity> &
    SortActions<Entity> &
    LoadEntitiesActions<Entity> &
    FilterActions<any> &
    PaginationActions,
  allMutators: MultipleSelectionMutators<Entity>,
  allConfigs: LoadEntitiesKeyedConfig<Entity> &
    PaginationKeyedConfig &
    SortKeyedConfig<Entity>
): import('@ngrx/store').ActionReducer<S, import('@ngrx/store').Action>;
