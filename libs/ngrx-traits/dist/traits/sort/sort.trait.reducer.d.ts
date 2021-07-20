import { LoadEntitiesActions, LoadEntitiesKeyedConfig } from '../load-entities';
import {
  EntityAndSortState,
  SortActions,
  SortKeyedConfig,
  SortMutators,
} from './sort.model';
export declare function createSortInitialState<Entity>(
  previousInitialState: any,
  allConfigs: SortKeyedConfig<Entity>
): EntityAndSortState<Entity>;
export declare function createSortTraitReducer<
  Entity,
  S extends EntityAndSortState<Entity> = EntityAndSortState<Entity>
>(
  initialState: S,
  allActions: SortActions<Entity> & LoadEntitiesActions<Entity>,
  allMutators: SortMutators<Entity>,
  allConfigs: LoadEntitiesKeyedConfig<Entity> & SortKeyedConfig<Entity>
): import('@ngrx/store').ActionReducer<S, import('@ngrx/store').Action>;
