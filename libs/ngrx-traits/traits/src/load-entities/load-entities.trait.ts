import {
  createLoadEntitiesInitialState,
  createLoadEntitiesTraitReducer,
} from './load-entities.trait.reducer';
import {
  EntityAndStatusState,
  LoadEntitiesConfig,
  LoadEntitiesKeyedConfig,
  loadEntitiesTraitKey,
} from './load-entities.model';
import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
  TraitSelectorsFactoryConfig,
  TraitStateMutatorsFactoryConfig,
} from 'ngrx-traits';
import { PaginationKeyedConfig } from '../pagination';
import { createLoadEntitiesTraitMutators } from './load-entities.mutators';
import { createTraitFactory } from 'ngrx-traits';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { createLoadEntitiesTraitActions } from './load-entities.trait.actions';
import { createLoadEntitiesTraitSelectors } from './load-entities.trait.selectors';

/**
 * Generates the ngrx code needed to load a list of entities from the backend
 * with a fetch, fetchSuccess, fetchFail actions, and selectors to query the
 * entities like selectAll, selectIds, selectEntities, and its progress loading
 * with isLoading,isSuccess, isFail. This trait is the base for all other traits related
 * to a list of entities, the other will call fetch when needing data.
 * @param traitConfig - Config object fot the trait factory
 * @param traitConfig.selectId - Function that returns the id of an entity
 * @param traitConfig.sortComparer - Default sort function for to @ngrx/entity EntityAdapter
 *
 * @example
 * // The following trait config
 *
 * export interface TestState
 * extends EntityAndStatusState<Todo>{}
 *
 *    const traits = createEntityFeatureFactory(
 *      addLoadEntities<Todo>(),
 *    )({
 *      actionsGroupKey: '[Todos]',
 *      featureSelector: createFeatureSelector<TestState>>(
 *        'todos',
 *      ),
 *    });
 * // will generate the actions and selectors
 * traits.actions.fetch()
 * traits.actions.fetchSuccess({entities: todos})
 * traits.actions.fetchFail();
 * traits.selectors.selectAll
 * traits.selectors.selectEntities
 * traits.selectors.selectIds
 * traits.selectors.selectTotal
 * traits.selectors.isLoading
 * traits.selectors.isSuccess
 * traits.selectors.isFail
 */
export function addLoadEntities<Entity>(
  traitConfig?: Omit<LoadEntitiesConfig<Entity>, 'adapter'>
) {
  const adapter: EntityAdapter<Entity> = createEntityAdapter(traitConfig);

  return createTraitFactory({
    key: loadEntitiesTraitKey,
    config: { ...traitConfig, adapter } as LoadEntitiesConfig<Entity>,
    actions: ({ actionsGroupKey }: TraitActionsFactoryConfig) =>
      createLoadEntitiesTraitActions<Entity>(actionsGroupKey),
    selectors: ({ allConfigs }: TraitSelectorsFactoryConfig) =>
      createLoadEntitiesTraitSelectors<Entity>(
        allConfigs as LoadEntitiesKeyedConfig<Entity> & PaginationKeyedConfig
      ),
    mutators: ({ allConfigs }: TraitStateMutatorsFactoryConfig) =>
      createLoadEntitiesTraitMutators<Entity>(
        allConfigs as LoadEntitiesKeyedConfig<Entity> & PaginationKeyedConfig
      ),
    initialState: ({
      previousInitialState,
      allConfigs,
    }: TraitInitialStateFactoryConfig) =>
      createLoadEntitiesInitialState<Entity>(previousInitialState, allConfigs),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createLoadEntitiesTraitReducer<Entity, EntityAndStatusState<Entity>>(
        initialState,
        allActions,
        allMutators,
        allConfigs as LoadEntitiesKeyedConfig<Entity> & PaginationKeyedConfig
      ),
  });
}
