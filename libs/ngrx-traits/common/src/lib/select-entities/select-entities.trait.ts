import { createSelectEntitiesTraitActions } from './select-entities.trait.actions';
import { SortEntitiesActions, SortEntitiesKeyedConfig } from '../sort-entities';
import { createSelectEntitiesTraitSelectors } from './select-entities.trait.selectors';
import {
  SelectEntitiesSelectors,
  SelectEntitiesActions,
} from './select-entities.model';
import {
  EntitiesPaginationActions,
  EntitiesPaginationKeyedConfig,
} from '../entities-pagination/entities-pagination.model';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesSelectors,
  loadEntitiesTraitKey,
} from '../load-entities/load-entities.model';
import { createTraitFactory } from '@ngrx-traits/core';
import { CrudEntitiesActions } from '../crud-entities/crud-entities.model';
import {
  createSelectEntitiesInitialState,
  createSelectEntitiesTraitReducer,
} from './select-entities.trait.reducer';
import { createSelectEntitiesTraitMutators } from './select-entities.trait.mutators';
import { FilterEntitiesActions } from '../filter-entities';
import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
  TraitSelectorsFactoryConfig,
  TraitStateMutatorsFactoryConfig,
} from '@ngrx-traits/core';

/**
 * Generates ngrx code to add multi selection to a list
 *
 * @example
 * // The following trait config
 *
 * export interface TestState
 * extends EntityAndStatusState<Todo>,MultipleSelectionState{}
 *
 *    const traits = createEntityFeatureFactory(
 *      {entityName: 'Todo'},
 *      addLoadEntitiesTrait<Todo>(),
 *      addSelectEntitiesTrait<Todo>()
 *    )({
 *      actionsGroupKey: '[Todos]',
 *      featureSelector: createFeatureSelector<TestState>>(
 *        'todos',
 *      ),
 *    });
 *
 * //   adds following props to the state:
 * //    selectedIds: Dictionary<boolean>;
 *
 * // generated actions
 * traits.actions.selectTodos({id})
 * traits.actions.deselectTodos({id})
 * traits.actions.toggleSectTodos({id})
 * traits.actions.toggleSelectAllTodos()
 * traits.actions.clearTodosSelection()
 * //generated selectors
 * traits.selectors.isAllTodosSelected()
 * traits.selectors.selectTodosIdsSelectedMap()
 * traits.selectors.selectTodosIdsSelectedList()
 * traits.selectors.selectTodosSelectedMap()
 * traits.selectors.selectTodosSelectedList()
 * traits.selectors.selectTotalSelectedTodos()
 */
export function addSelectEntitiesTrait<Entity>() {
  return createTraitFactory({
    key: 'SelectEntities',
    depends: [loadEntitiesTraitKey],
    actions: ({ actionsGroupKey, entitiesName }: TraitActionsFactoryConfig) =>
      createSelectEntitiesTraitActions(actionsGroupKey, entitiesName),
    selectors: ({ previousSelectors }: TraitSelectorsFactoryConfig) =>
      createSelectEntitiesTraitSelectors<Entity>(
        previousSelectors as LoadEntitiesSelectors<Entity>
      ),
    initialState: ({ previousInitialState }: TraitInitialStateFactoryConfig) =>
      createSelectEntitiesInitialState<Entity>(previousInitialState),
    mutators: ({ allSelectors }: TraitStateMutatorsFactoryConfig) =>
      createSelectEntitiesTraitMutators<Entity>(
        allSelectors as SelectEntitiesSelectors<Entity>
      ),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createSelectEntitiesTraitReducer(
        initialState,
        allActions as SelectEntitiesActions &
          CrudEntitiesActions<Entity> &
          SortEntitiesActions<Entity> &
          LoadEntitiesActions<Entity> &
          FilterEntitiesActions<any> &
          EntitiesPaginationActions,
        allMutators,
        allConfigs as LoadEntitiesKeyedConfig<Entity> &
          EntitiesPaginationKeyedConfig &
          SortEntitiesKeyedConfig<Entity>
      ),
  });
}
