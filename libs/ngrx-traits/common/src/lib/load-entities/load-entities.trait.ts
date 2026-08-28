import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
  TraitSelectorsFactoryConfig,
  TraitStateMutatorsFactoryConfig,
} from '@ngrx-traits/core';
import { createTraitFactory } from '@ngrx-traits/core';
import {
  Comparer,
  createEntityAdapter,
  EntityAdapter,
  IdSelector,
} from '@ngrx/entity';

import { EntitiesPaginationKeyedConfig } from '../entities-pagination';
import {
  LoadEntitiesConfig,
  LoadEntitiesKeyedConfig,
  LoadEntitiesState,
  loadEntitiesTraitKey,
} from './load-entities.model';
import { createLoadEntitiesTraitMutators } from './load-entities.mutators';
import { createLoadEntitiesTraitActions } from './load-entities.trait.actions';
import {
  createLoadEntitiesInitialState,
  createLoadEntitiesTraitReducer,
} from './load-entities.trait.reducer';
import { createLoadEntitiesTraitSelectors } from './load-entities.trait.selectors';

/**
 * Generates the ngrx code needed to load a list of entities from the backend. This trait is the base for all other traits related
 * to a list of entities, the other will call loadEntities when needing data. See the example for the list of actions and selectors this generates
 *
 * @param traitConfig - Config object for the trait factory
 * @param traitConfig.selectId - Function that returns the id of an entity
 * @param traitConfig.sortComparer - Default sort function for to @ngrx/entity EntityAdapter
 *
 * @example
 * // The following trait config
 *
 * export interface TestState
 * extends LoadEntitiesState<Todo>{}
 *
 *    const traits = createEntityFeatureFactory(
 *      {entityName: 'Todo'},
 *      addLoadEntitiesTrait<Todo>(),
 *    )({
 *      actionsGroupKey: '[Todos]',
 *      featureSelector: createFeatureSelector<TestState>>(
 *        'todos',
 *      ),
 *    });
 *
 * //   adds following props to the state:
 * //    ids: string[] | number[];
 * //    entities: Dictionary<Todo>;
 * //    status?: 'loading' | 'success' | 'fail';
 *
 * // generated actions
 * traits.actions.loadTodos()
 * traits.actions.loadTodosSuccess({entities: todos})
 * traits.actions.loadTodosFail();
 * // generated selectors
 * traits.selectors.selectTodosList
 * traits.selectors.selectTodosMap
 * traits.selectors.selectTodosIds
 * traits.selectors.selectTodosTotal
 * traits.selectors.isTodosLoading
 * traits.selectors.isTodosLoadingSuccess
 * traits.selectors.isTodosLoadingFail
 */
export function addLoadEntitiesTrait<Entity>(
  traitConfig?: Omit<LoadEntitiesConfig<Entity>, 'adapter'>,
) {
  // @ngrx/entity v22 narrowed the createEntityAdapter overloads: they either
  // constrain Entity to have an `id`, or require `selectId` to be present.
  // Here traitConfig is optional and the adapter falls back to `entity.id` at
  // runtime, so pick the IdSelector overload explicitly.
  const adapter: EntityAdapter<Entity> = createEntityAdapter(
    traitConfig as {
      selectId: IdSelector<Entity>;
      sortComparer?: false | Comparer<Entity>;
    },
  );

  return createTraitFactory({
    key: loadEntitiesTraitKey,
    config: { ...traitConfig, adapter } as LoadEntitiesConfig<Entity>,
    actions: ({ actionsGroupKey, entitiesName }: TraitActionsFactoryConfig) =>
      createLoadEntitiesTraitActions<Entity>(actionsGroupKey, entitiesName),
    selectors: ({ allConfigs }: TraitSelectorsFactoryConfig) =>
      createLoadEntitiesTraitSelectors<Entity>(
        allConfigs as LoadEntitiesKeyedConfig<Entity> &
          EntitiesPaginationKeyedConfig,
      ),
    mutators: ({ allConfigs }: TraitStateMutatorsFactoryConfig) =>
      createLoadEntitiesTraitMutators<Entity>(
        allConfigs as LoadEntitiesKeyedConfig<Entity> &
          EntitiesPaginationKeyedConfig,
      ),
    initialState: ({
      previousInitialState,
      allConfigs,
    }: TraitInitialStateFactoryConfig) =>
      createLoadEntitiesInitialState<Entity>(previousInitialState, allConfigs),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createLoadEntitiesTraitReducer<Entity, LoadEntitiesState<Entity>>(
        initialState,
        allActions,
        allMutators,
        allConfigs as LoadEntitiesKeyedConfig<Entity> &
          EntitiesPaginationKeyedConfig,
      ),
  });
}
