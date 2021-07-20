import { LoadEntitiesActions } from '../load-entities/load-entities.model';
import {
  EntityAndFilterState,
  FilterKeyedConfig,
  FilterMutators,
} from './filter.model';
import { ƟFilterActions } from './filter.model.internal';
export declare function createFilterInitialState<Entity, F>(
  previousInitialState: any,
  allConfigs: FilterKeyedConfig<Entity, F>
): EntityAndFilterState<Entity, F>;
export declare function createFilterTraitReducer<
  T,
  F,
  S extends EntityAndFilterState<T, F>
>(
  initialState: S,
  allActions: ƟFilterActions<F> & LoadEntitiesActions<T>,
  allMutators: FilterMutators<T, F>
): import('@ngrx/store').ActionReducer<S, import('@ngrx/store').Action>;
