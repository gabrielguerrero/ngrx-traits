import {
  EntityAndStatusState,
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesMutators,
} from './load-entities.model';
import { PaginationKeyedConfig } from '../pagination';
export declare function createLoadEntitiesInitialState<Entity>(
  previousInitialState: {},
  allConfigs: LoadEntitiesKeyedConfig<Entity>
): EntityAndStatusState<Entity>;
export declare function createLoadEntitiesTraitReducer<
  T,
  S extends EntityAndStatusState<T>
>(
  initialState: S,
  actions: LoadEntitiesActions<T>,
  allMutators: LoadEntitiesMutators<T>,
  allConfigs: LoadEntitiesKeyedConfig<T> & PaginationKeyedConfig
): import('@ngrx/store').ActionReducer<S, import('@ngrx/store').Action>;
