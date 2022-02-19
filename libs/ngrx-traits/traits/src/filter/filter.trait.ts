import {
  EntitiesPaginationActions,
  entitiesPaginationTraitKey,
} from '../pagination/pagination.model';
import { createFilterTraitEffects } from './filter.trait.effect';
import {
  createFilterInitialState,
  createFilterTraitReducer,
} from './filter.trait.reducer';
import {
  FilterEntitiesConfig,
  FilterEntitiesKeyedConfig,
  FilterEntitiesSelectors,
  filterEntitiesTraitKey,
} from './filter.model';
import { createFilterTraitSelectors } from './filter.trait.selectors';
import {
  LoadEntitiesActions,
  LoadEntitiesSelectors,
  loadEntitiesTraitKey,
} from '../load-entities/load-entities.model';
import { createFilterTraitMutators } from './filter.trait.mutators';
import { createTraitFactory } from 'ngrx-traits';
import { createFilterTraitActions } from './filter.trait.actions';
import { ƟFilterEntitiesActions } from './filter.model.internal';
import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
} from 'ngrx-traits';

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
 * is filtered by the backend
 * @param traitConfig.defaultDebounceTime - Value in milliseconds. Default to 400ms
 *
 * @example
 * // The following trait config
 *
 * export interface TestState
 * extends EntityAndStatusState<Todo>,FilterState<TodoFilter>{}
 *
 *    const traits = createEntityFeatureFactory(
 *      addLoadEntities<Todo>(),
 *      //addFilter<Todo,TodoFilter>() //  remote filtering
 *      addFilter<Todo,TodoFilter>({filterFn: (filter, entity) => // local filtering
 *          filter?.content && entity.content?.includes(filter?.content) || false})// remote
 *    )({
 *      actionsGroupKey: '[Todos]',
 *      featureSelector: createFeatureSelector<TestState>>(
 *        'todos',
 *      ),
 *    });
 * // will generate  the following actions and selectors, plus the ones generated by other traits
 * traits.actions.filterEntities()
 * traits.selectors.selectEntitiesFilter()
 */
export function addFilterEntities<Entity, F>({
  defaultDebounceTime = 400,
  defaultFilter,
  filterFn,
}: FilterEntitiesConfig<Entity, F> = {}) {
  return createTraitFactory({
    key: filterEntitiesTraitKey,
    depends: [entitiesPaginationTraitKey, loadEntitiesTraitKey],
    config: {
      defaultDebounceTime,
      defaultFilter,
      filterFn,
    } as FilterEntitiesConfig<Entity, F>,
    actions: ({ actionsGroupKey }: TraitActionsFactoryConfig) =>
      createFilterTraitActions<F>(actionsGroupKey),
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
