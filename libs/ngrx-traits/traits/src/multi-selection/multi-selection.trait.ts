import { createMultiSelectionTraitActions } from './multi-selection.trait.actions';
import { SortActions, SortKeyedConfig } from '../sort';
import { createMultiSelectionTraitSelectors } from './multi-selection.trait.selectors';
import {
  MultipleSelectionSelectors,
  MultiSelectActions,
} from './multi-selection.model';
import {
  PaginationActions,
  PaginationKeyedConfig,
} from '../pagination/pagination.model';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesSelectors,
  loadEntitiesTraitKey,
} from '../load-entities/load-entities.model';
import { createTraitFactory } from 'ngrx-traits';
import { CrudActions } from '../crud/crud.model';
import {
  createMultiSelectionInitialState,
  createMultiSelectionTraitReducer,
} from './multi-selection.trait.reducer';
import { createMultiSelectionTraitMutators } from './multi-selection.trait.mutators';
import { FilterActions } from '../filter';
import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
  TraitSelectorsFactoryConfig,
  TraitStateMutatorsFactoryConfig,
} from 'ngrx-traits';

export function addMultiSelection<Entity>() {
  return createTraitFactory({
    key: 'multiSelection',
    depends: [loadEntitiesTraitKey],
    actions: ({ actionsGroupKey }: TraitActionsFactoryConfig) =>
      createMultiSelectionTraitActions(actionsGroupKey),
    selectors: ({ previousSelectors }: TraitSelectorsFactoryConfig) =>
      createMultiSelectionTraitSelectors<Entity>(
        previousSelectors as LoadEntitiesSelectors<Entity>
      ),
    initialState: ({ previousInitialState }: TraitInitialStateFactoryConfig) =>
      createMultiSelectionInitialState<Entity>(previousInitialState),
    mutators: ({ allSelectors }: TraitStateMutatorsFactoryConfig) =>
      createMultiSelectionTraitMutators<Entity>(
        allSelectors as MultipleSelectionSelectors<Entity>
      ),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createMultiSelectionTraitReducer(
        initialState,
        allActions as MultiSelectActions &
          CrudActions<Entity> &
          SortActions<Entity> &
          LoadEntitiesActions<Entity> &
          FilterActions<any> &
          PaginationActions,
        allMutators,
        allConfigs as LoadEntitiesKeyedConfig<Entity> &
          PaginationKeyedConfig &
          SortKeyedConfig<Entity>
      ),
  });
}
