import { createSortTraitMutators } from './sort.trait.mutators';
import {
  createSortInitialState,
  createSortTraitReducer,
} from './sort.trait.reducer';
import { createSortTraitSelectors } from './sort.trait.selectors';
import { createSortTraitEffect } from './sort.trait.effect';
import {
  SortActions,
  SortConfig,
  SortKeyedConfig,
  SortSelectors,
  sortTraitKey,
} from './sort.model';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesSelectors,
  loadEntitiesTraitKey,
} from '../load-entities/load-entities.model';
import {
  PaginationActions,
  PaginationKeyedConfig,
} from '../pagination/pagination.model';
import { createTraitFactory } from 'ngrx-traits';
import { createSortTraitActions } from './sort.trait.actions';
import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
  TraitStateMutatorsFactoryConfig,
} from 'ngrx-traits';

export function addSort<Entity>({
  remote = false,
  defaultSort,
}: SortConfig<Entity>) {
  return createTraitFactory({
    key: sortTraitKey,
    depends: [loadEntitiesTraitKey],
    config: { remote, defaultSort } as SortConfig<Entity>,
    actions: ({ actionsGroupKey }: TraitActionsFactoryConfig) =>
      createSortTraitActions<Entity>(actionsGroupKey),
    selectors: () => createSortTraitSelectors<Entity>(),
    mutators: ({ allSelectors, allConfigs }: TraitStateMutatorsFactoryConfig) =>
      createSortTraitMutators<Entity>(
        allSelectors as SortSelectors<Entity> & LoadEntitiesSelectors<Entity>,
        allConfigs
      ),
    initialState: ({
      previousInitialState,
      allConfigs,
    }: TraitInitialStateFactoryConfig) =>
      createSortInitialState<Entity>(previousInitialState, allConfigs),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createSortTraitReducer<Entity>(
        initialState,
        allActions as SortActions<Entity> & LoadEntitiesActions<Entity>,
        allMutators,
        allConfigs as LoadEntitiesKeyedConfig<Entity> &
          PaginationKeyedConfig &
          SortKeyedConfig<Entity>
      ),
    effects: ({ allActions, allConfigs }) =>
      createSortTraitEffect(
        allActions as LoadEntitiesActions<Entity> &
          SortActions<Entity> &
          PaginationActions,
        allConfigs as LoadEntitiesKeyedConfig<Entity> & SortKeyedConfig<Entity>
      ),
  });
}
