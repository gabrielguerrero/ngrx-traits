import {
  PaginationActions,
  paginationTraitKey,
} from '../pagination/pagination.model';
import { createFilterTraitEffects } from './filter.trait.effect';
import {
  createFilterInitialState,
  createFilterTraitReducer,
} from './filter.trait.reducer';
import {
  FilterConfig,
  FilterKeyedConfig,
  FilterSelectors,
  filterTraitKey,
} from './filter.model';
import { createFilterTraitSelectors } from './filter.trait.selectors';
import {
  LoadEntitiesActions,
  LoadEntitiesSelectors,
  loadEntitiesTraitKey,
} from '../load-entities/load-entities.model';
import { createFilterTraitMutators } from './filter.trait.mutators';
import { createTraitFactory } from 'ngrx-traits';
import { createFilterTraitActions } from './filter.trait.actions';
import { ƟFilterActions } from './filter.model.internal';
import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
} from 'ngrx-traits';

export function addFilter<Entity, F>({
  defaultDebounceTime = 400,
  defaultFilter,
  filterFn,
}: FilterConfig<Entity, F> = {}) {
  return createTraitFactory({
    key: filterTraitKey,
    depends: [paginationTraitKey, loadEntitiesTraitKey],
    config: { defaultDebounceTime, defaultFilter, filterFn } as FilterConfig<
      Entity,
      F
    >,
    actions: ({ actionsGroupKey }: TraitActionsFactoryConfig) =>
      createFilterTraitActions<F>(actionsGroupKey),
    selectors: () => createFilterTraitSelectors<Entity, F>(),
    mutators: () => createFilterTraitMutators<Entity, F>(),
    initialState: ({
      previousInitialState,
      allConfigs,
    }: TraitInitialStateFactoryConfig) =>
      createFilterInitialState<Entity, F>(
        previousInitialState,
        allConfigs as FilterKeyedConfig<Entity, F>
      ),
    reducer: ({ initialState, allActions, allMutators }) =>
      createFilterTraitReducer(
        initialState,
        allActions as ƟFilterActions<F> & LoadEntitiesActions<Entity>,
        allMutators
      ),
    effects: ({ allActions, allSelectors, allConfigs }) =>
      createFilterTraitEffects(
        allActions as ƟFilterActions<F> &
          LoadEntitiesActions<Entity> &
          PaginationActions,
        allSelectors as FilterSelectors<Entity, F> &
          LoadEntitiesSelectors<Entity>,
        allConfigs
      ),
  });
}
