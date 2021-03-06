import {
  EntitiesPaginationActions,
  entitiesPaginationTraitKey,
} from '../entities-pagination/entities-pagination.model';
import { createFilterTraitEffects } from './filter-entities.trait.effect';
import {
  createFilterInitialState,
  createFilterTraitReducer,
} from './filter-entities.trait.reducer';
import {
  FilterEntitiesConfig,
  FilterEntitiesKeyedConfig,
  FilterEntitiesSelectors,
  filterEntitiesTraitKey,
} from './filter-entities.model';
import { createFilterTraitSelectors } from './filter-entities.trait.selectors';
import {
  LoadEntitiesActions,
  LoadEntitiesSelectors,
  loadEntitiesTraitKey,
} from '../load-entities/load-entities.model';
import { createFilterTraitMutators } from './filter-entities.trait.mutators';
import { createTraitFactory } from '@ngrx-traits/core';
import { createFilterTraitActions } from './filter-entities.trait.actions';
import { ƟFilterEntitiesActions } from './filter-entities.model.internal';
import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
} from '@ngrx-traits/core';

/**
 * Generates the ngrx code needed to filter a list of entities locally or remotely, adds a filter
 * action and a selectFilter selector, the filter action is debounced and the filter will only
 * call the loadEntities action if the params have changed, so there is no need to implement that in
 * the components. The filter action has a `forceLoad` param which can
 * be use to skip that restriction for one call or setting the `defaultDebounceTime` to 0 for all calls.
 * Calling the filter action will also replace the `filters` param in the store, if the `patch` param is set
 * the filters are merged with the previous value in the store.
 * @param traitConfig - Config object fot the trait factory
 * @param traitConfig.defaultFilter - Initial value for the filter
 * @param traitConfig.filterFn - Function to filter entities in memory, if not present then its expected
 * is filtered by the backend unless isRemoteFilter is defned
 * @param traitConfig.defaultDebounceTime - Value in milliseconds. Default to 400ms
 * @param traitConfig.isRemoteFilter - Function to when it returns true it fires loadEntities so a remote
 * backend filtering can run, otherwise it uses filterFn to do a local filtering
 *
 * @example
 * // The following trait config
 *
 * export interface TestState
 * extends LoadEntitiesState<Todo>, FilterEntitiesState<TodoFilter>{}
 *
 *    const traits = createEntityFeatureFactory(
 *      {entityName: 'Todo'},
 *      addLoadEntitiesTrait<Todo>(),
 *      //addFilterEntitiesTrait<Todo,TodoFilter>() // no params uses remote filtering
 *      addFilterEntitiesTrait<Todo,TodoFilter>({filterFn: (filter, entity) => // local filtering
 *          !filter.content || !!entity.content?.includes(filter.content.toLowerCase())
 *          // or use the following function to switch between remote search and local
 *          // depending on which properties have changed in the filter
 *          // isRemoteFilter: (previous, current) => previous?.someRemoteParam !== current?.someRemoteParam,
 *    )({
 *      actionsGroupKey: '[Todos]',
 *      featureSelector: createFeatureSelector<TestState>>(
 *        'todos',
 *      ),
 *    });
 *
 * //   adds following props to the state:
 * //    filters?: TodoFilter;
 *
 * // generated actions
 * traits.actions.filterTodos()
 * // generated selectors
 * traits.selectors.selectTodosFilter()
 */
export function addFilterEntitiesTrait<Entity, F>({
  defaultDebounceTime = 400,
  defaultFilter,
  filterFn,
  isRemoteFilter,
}: FilterEntitiesConfig<Entity, F> = {}) {
  return createTraitFactory({
    key: filterEntitiesTraitKey,
    depends: [entitiesPaginationTraitKey, loadEntitiesTraitKey],
    config: {
      defaultDebounceTime,
      defaultFilter,
      filterFn,
      isRemoteFilter,
    } as FilterEntitiesConfig<Entity, F>,
    actions: ({ actionsGroupKey, entitiesName }: TraitActionsFactoryConfig) =>
      createFilterTraitActions<F>(actionsGroupKey, entitiesName),
    selectors: () => createFilterTraitSelectors<Entity, F>(),
    mutators: () => createFilterTraitMutators<Entity, F>(),
    initialState: ({
      previousInitialState,
      allConfigs,
    }: TraitInitialStateFactoryConfig) =>
      createFilterInitialState<Entity, F>(
        previousInitialState,
        allConfigs as FilterEntitiesKeyedConfig<Entity, F>
      ),
    reducer: ({ initialState, allActions, allMutators }) =>
      createFilterTraitReducer(
        initialState,
        allActions as ƟFilterEntitiesActions<F> & LoadEntitiesActions<Entity>,
        allMutators
      ),
    effects: ({ allActions, allSelectors, allConfigs }) =>
      createFilterTraitEffects(
        allActions as ƟFilterEntitiesActions<F> &
          LoadEntitiesActions<Entity> &
          EntitiesPaginationActions,
        allSelectors as FilterEntitiesSelectors<Entity, F> &
          LoadEntitiesSelectors<Entity>,
        allConfigs
      ),
  });
}
