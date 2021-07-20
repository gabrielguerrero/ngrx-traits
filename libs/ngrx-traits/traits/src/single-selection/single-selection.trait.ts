import {
  createTraitFactory,
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
} from 'ngrx-traits';

import { createSingleSelectionTraitActions } from './single-selection.trait.actions';
import { createSingleSelectionTraitSelectors } from './single-selection.trait.selectors';
import {
  createSingleSelectionInitialState,
  createSingleSelectionTraitReducer,
} from './single-selection.trait.reducer';
import { createSingleSelectionTraitMutators } from './single-selection.trait.mutators';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  loadEntitiesTraitKey,
} from '../load-entities/load-entities.model';
import { SortActions, SortKeyedConfig } from '../sort/sort.model';
import {
  SingleSelectionActions,
  SingleSelectionConfig,
  SingleSelectionKeyedConfig,
} from './single-selection.model';
import { CrudActions } from '../crud/crud.model';
import {
  PaginationActions,
  PaginationKeyedConfig,
} from '../pagination/pagination.model';
import { FilterActions } from '../filter';

export function addSingleSelection<Entity>(config?: SingleSelectionConfig) {
  return createTraitFactory({
    key: 'singleSelection',
    depends: [loadEntitiesTraitKey],
    config,
    actions: ({ actionsGroupKey }: TraitActionsFactoryConfig) =>
      createSingleSelectionTraitActions(actionsGroupKey),
    selectors: () => createSingleSelectionTraitSelectors<Entity>(),
    mutators: () => createSingleSelectionTraitMutators(),
    initialState: ({
      previousInitialState,
      allConfigs,
    }: TraitInitialStateFactoryConfig) =>
      createSingleSelectionInitialState<Entity>(
        previousInitialState,
        allConfigs as SingleSelectionKeyedConfig
      ),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createSingleSelectionTraitReducer(
        initialState,
        allActions as SingleSelectionActions &
          CrudActions<Entity> &
          SortActions<Entity> &
          PaginationActions &
          FilterActions<any> &
          LoadEntitiesActions<Entity>,
        allMutators,
        allConfigs as SingleSelectionKeyedConfig &
          LoadEntitiesKeyedConfig<Entity> &
          PaginationKeyedConfig &
          SortKeyedConfig<Entity>
      ),
  });
}
