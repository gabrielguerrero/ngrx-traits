import {
  createTraitFactory,
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
} from '@ngrx-traits/core';

import { createSelectEntityTraitActions } from './select-entity.trait.actions';
import { createSelectEntityTraitSelectors } from './select-entity.trait.selectors';
import {
  createSelectEntityInitialState,
  createSelectEntityTraitReducer,
} from './select-entity.trait.reducer';
import { createSelectEntityTraitMutators } from './select-entity.trait.mutators';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  loadEntitiesTraitKey,
} from '../load-entities/load-entities.model';
import {
  SortEntitiesActions,
  SortEntitiesKeyedConfig,
} from '../sort-entities/sort-entities.model';
import {
  SelectEntityActions,
  SelectEntityConfig,
  SelectEntityKeyedConfig,
} from './select-entity.model';
import { CrudEntitiesActions } from '../crud-entities/crud-entities.model';
import {
  EntitiesPaginationActions,
  EntitiesPaginationKeyedConfig,
} from '../entities-pagination/entities-pagination.model';
import { FilterEntitiesActions } from '../filter-entities';

/**
 * Generates ngrx code to add single selection to a list
 * @param config
 * @param config.selectedId - Default selected id
 *
 * @example
 * // The following trait config
 *
 * export interface TestState
 * extends EntityAndStatusState<Todo>,SelectEntityState{}
 *
 *    const traits = createEntityFeatureFactory(
 *      {entityName: 'Todo'},
 *      addLoadEntitiesTrait<Todo>(),
 *      addSelectEntityTrait<Todo>()
 *    )({
 *      actionsGroupKey: '[Todos]',
 *      featureSelector: createFeatureSelector<TestState>>(
 *        'todos',
 *      ),
 *    });
 *
 * //   adds following props to the state:
 * //     selectedId?: number | string;
 *
 * // generated actions
 * traits.actions.selectTodo({id})
 * traits.actions.deselectTodo()
 * traits.actions.toggleSelectTodo({id})
 * //generated selectors
 * traits.selectors.selectTodoIdSelected()
 * traits.selectors.selectTodoSelected()
 */
export function addSelectEntityTrait<Entity>(config?: SelectEntityConfig) {
  return createTraitFactory({
    key: 'singleSelection',
    depends: [loadEntitiesTraitKey],
    config,
    actions: ({ actionsGroupKey, entityName }: TraitActionsFactoryConfig) =>
      createSelectEntityTraitActions(actionsGroupKey, entityName),
    selectors: () => createSelectEntityTraitSelectors<Entity>(),
    mutators: () => createSelectEntityTraitMutators(),
    initialState: ({
      previousInitialState,
      allConfigs,
    }: TraitInitialStateFactoryConfig) =>
      createSelectEntityInitialState<Entity>(
        previousInitialState,
        allConfigs as SelectEntityKeyedConfig
      ),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createSelectEntityTraitReducer(
        initialState,
        allActions as SelectEntityActions &
          CrudEntitiesActions<Entity> &
          SortEntitiesActions<Entity> &
          EntitiesPaginationActions &
          FilterEntitiesActions<any> &
          LoadEntitiesActions<Entity>,
        allMutators,
        allConfigs as SelectEntityKeyedConfig &
          LoadEntitiesKeyedConfig<Entity> &
          EntitiesPaginationKeyedConfig &
          SortEntitiesKeyedConfig<Entity>
      ),
  });
}
