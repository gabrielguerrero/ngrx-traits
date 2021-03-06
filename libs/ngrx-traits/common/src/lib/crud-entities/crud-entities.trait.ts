import {
  createTraitFactory,
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
  TraitSelectorsFactoryConfig,
  TraitStateMutatorsFactoryConfig,
} from '@ngrx-traits/core';
import { createCrudTraitActions } from './crud-entities.trait.actions';
import { createCrudTraitSelectors } from './crud-entities.trait.selectors';
import {
  createCrudInitialState,
  createCrudTraitReducer,
} from './crud-entities.trait.reducer';
import {
  SortEntitiesActions,
  SortEntitiesKeyedConfig,
} from '../sort-entities/sort-entities.model';
import {
  CrudEntitiesActions,
  CrudEntitiesConfig,
  CrudEntitiesKeyedConfig,
  crudEntitiesTraitKey,
} from './crud-entities.model';
import {
  FilterEntitiesActions,
  FilterEntitiesKeyedConfig,
} from '../filter-entities/filter-entities.model';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesSelectors,
  loadEntitiesTraitKey,
} from '../load-entities/load-entities.model';
import {
  EntitiesPaginationActions,
  EntitiesPaginationKeyedConfig,
} from '../entities-pagination/entities-pagination.model';
import { createCrudTraitMutators } from './crud-entities.trait.mutators';

/**
 * Generates ngrx code to add, remove update, upsert entities on a list, it also
 * tracks the changes made, helpful for implementing batch updates. The `storeChanges` (false by default),
 * will store for add and update the changed entity props in the property `entityChanges` of the `Change` object.
 * @param config
 * @param config.storeChanges - Will store the changes made, default fals
 *
 * @example
 * // The following trait config
 *
 * export interface TestState
 * extends EntityAndStatusState<Todo>, CrudState<Todo>{}
 *
 *    const traits = createEntityFeatureFactory(
 *      {entityName: 'Todo'},
 *      addLoadEntitiesTrait<Todo>(),
 *      addCrudEntitiesTrait<Todo>()
 *    )({
 *      actionsGroupKey: '[Todos]',
 *      featureSelector: createFeatureSelector<TestState>>(
 *        'todos',
 *      ),
 *    });
 *
 * //   adds following props to the state:
 * //    changes: Change<Todo>[];
 *
 * // generated actions
 * traits.actions.addTodos(entity1,entity2...)
 * traits.actions.updateTodos({id: id1, changes:{prop1}},{id: id2, changes:{prop2}} ...)
 * traits.actions.upsertTodos(entity1,entity2...)
 * traits.actions.removeAllTodos()
 * traits.actions.clearTodosChanges()
 * // generated selectors
 * traits.selectors.selectTodosChangesList()
 * traits.selectors.selectFilteredTodosChangesList()
 * traits.selectors.selectAllFilteredChanges()
 */
export function addCrudEntitiesTrait<Entity>({
  storeChanges = false,
}: CrudEntitiesConfig = {}) {
  return createTraitFactory({
    key: crudEntitiesTraitKey,
    depends: [loadEntitiesTraitKey],
    config: { storeChanges } as CrudEntitiesConfig,
    actions: ({ actionsGroupKey, entitiesName }: TraitActionsFactoryConfig) =>
      createCrudTraitActions<Entity>(actionsGroupKey, entitiesName),
    selectors: ({ previousSelectors }: TraitSelectorsFactoryConfig) =>
      createCrudTraitSelectors<Entity>(
        previousSelectors as LoadEntitiesSelectors<Entity>
      ),
    mutators: ({ allConfigs }: TraitStateMutatorsFactoryConfig) =>
      createCrudTraitMutators<Entity>(
        allConfigs as CrudEntitiesKeyedConfig & LoadEntitiesKeyedConfig<Entity>
      ),
    initialState: ({ previousInitialState }: TraitInitialStateFactoryConfig) =>
      createCrudInitialState<Entity>(previousInitialState),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createCrudTraitReducer(
        initialState,
        allActions as CrudEntitiesActions<Entity> &
          LoadEntitiesActions<Entity> &
          SortEntitiesActions<Entity> &
          FilterEntitiesActions<any> &
          EntitiesPaginationActions,
        allMutators,
        allConfigs as CrudEntitiesKeyedConfig &
          FilterEntitiesKeyedConfig<Entity, unknown> &
          LoadEntitiesKeyedConfig<Entity> &
          SortEntitiesKeyedConfig<Entity> &
          EntitiesPaginationKeyedConfig
      ),
  });
}
