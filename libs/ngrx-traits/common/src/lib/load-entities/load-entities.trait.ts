import {
  createLoadEntitiesInitialState,
  createLoadEntitiesTraitReducer,
} from './load-entities.trait.reducer';
import {
  LoadEntitiesState,
  LoadEntitiesConfig,
  LoadEntitiesKeyedConfig,
  loadEntitiesTraitKey,
} from './load-entities.model';
import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
  TraitSelectorsFactoryConfig,
  TraitStateMutatorsFactoryConfig,
} from '@ngrx-traits/core';
import { EntitiesPaginationKeyedConfig } from '../entities-pagination';
import { createLoadEntitiesTraitMutators } from './load-entities.mutators';
import { createTraitFactory } from '@ngrx-traits/core';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { createLoadEntitiesTraitActions } from './load-entities.trait.actions';
import { createLoadEntitiesTraitSelectors } from './load-entities.trait.selectors';

/**
 * Generates the ngrx code needed to load a list of entities from the backend
 * with a load[EntitiesName], load[EntitiesName]Success, load[EntitiesName]Fail actions, and selectors to query the
 * entities like selectEntity[EntitiesName]List, selectEntity[EntitiesName]Ids, selectEntity[EntitiesName]Map, and its progress loading
 * with isLoading[EntitiesName],isLoading[EntitiesName]Success, isLoading[EntitiesName]Fail. This trait is the base for all other traits related
 * to a list of entities, the other will call loadEntities when needing data.
 * @param traitConfig - Config object fot the trait factory
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
 * // will generate the actions and selectors
 * traits.actions.loadTodos()
 * traits.actions.loadTodosSuccess({entities: todos})
 * traits.actions.loadTodosFail();
 * traits.selectors.selectTodosList
 * traits.selectors.selectTodosMap
 * traits.selectors.selectTodosIds
 * traits.selectors.selectTodosTotal
 * traits.selectors.isLoadingTodos
 * traits.selectors.isSuccessTodosSuccess
 * traits.selectors.isFailTodosFail
 */
export function addLoadEntitiesTrait<Entity>(
  traitConfig?: Omit<LoadEntitiesConfig<Entity>, 'adapter'>
) {
  const adapter: EntityAdapter<Entity> = createEntityAdapter(traitConfig);

  return createTraitFactory({
    key: loadEntitiesTraitKey,
    config: { ...traitConfig, adapter } as LoadEntitiesConfig<Entity>,
    actions: ({ actionsGroupKey, entitiesName }: TraitActionsFactoryConfig) =>
      createLoadEntitiesTraitActions<Entity>(actionsGroupKey, entitiesName),
    selectors: ({ allConfigs }: TraitSelectorsFactoryConfig) =>
      createLoadEntitiesTraitSelectors<Entity>(
        allConfigs as LoadEntitiesKeyedConfig<Entity> &
          EntitiesPaginationKeyedConfig
      ),
    mutators: ({ allConfigs }: TraitStateMutatorsFactoryConfig) =>
      createLoadEntitiesTraitMutators<Entity>(
        allConfigs as LoadEntitiesKeyedConfig<Entity> &
          EntitiesPaginationKeyedConfig
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
          EntitiesPaginationKeyedConfig
      ),
  });
}
