import { createSortTraitMutators } from './sort-entities.trait.mutators';
import {
  createSortInitialState,
  createSortTraitReducer,
} from './sort-entities.trait.reducer';
import { createSortTraitSelectors } from './sort-entities.trait.selectors';
import { createSortTraitEffect } from './sort-entities.trait.effect';
import {
  SortEntitiesActions,
  SortEntitiesConfig,
  SortEntitiesKeyedConfig,
  SortEntitiesSelectors,
  sortTraitKey,
} from './sort-entities.model';
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
import { createTraitFactory } from 'ngrx-traits';
import { createSortTraitActions } from './sort-entities.trait.actions';
import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
  TraitStateMutatorsFactoryConfig,
} from 'ngrx-traits';

/**
 * Generates ngrx code to sort locally or remotely a list of entities
 * @param config
 * @param config.defaultSort - Required, Default entity prop for the sort
 * @param config.remote - Optional field, default to false, when true disables local
 * sorting and every sort action call will now trigger a loadEntities action and the backend
 * should sort the data, use selectSort in the effect that call backend to get the requested sort,
 * when false all sorting is done in memory when the sort action is fired
 *
 * @example
 * // The following trait config
 * export interface TestState
 * extends EntityAndStatusState<Todo>, SortState<Todo>{}
 *
 *    const traits = createEntityFeatureFactory(
 *      addLoadEntitiesTrait<Todo>(),
 *      addSortEntitiesTrait<Todo>({
 *        defaultSort: {active:'id', direction:'asc'}
 *      })
 *    )({
 *      actionsGroupKey: '[Todos]',
 *      featureSelector: createFeatureSelector<TestState>>(
 *        'todos',
 *      ),
 *    });
 * // will generate  the following actions and selectors, plus the ones generated by other traits
 * traits.actions.sort({active:'id', direction:'desc'})
 * traits.actions.resetSort()
 *
 * traits.selectors.selectSort()
 */
export function addSortEntitiesTrait<Entity>({
  remote = false,
  defaultSort,
}: SortEntitiesConfig<Entity>) {
  return createTraitFactory({
    key: sortTraitKey,
    depends: [loadEntitiesTraitKey],
    config: { remote, defaultSort } as SortEntitiesConfig<Entity>,
    actions: ({ actionsGroupKey, entitiesName }: TraitActionsFactoryConfig) =>
      createSortTraitActions<Entity>(actionsGroupKey, entitiesName),
    selectors: () => createSortTraitSelectors<Entity>(),
    mutators: ({ allSelectors, allConfigs }: TraitStateMutatorsFactoryConfig) =>
      createSortTraitMutators<Entity>(
        allSelectors as SortEntitiesSelectors<Entity> &
          LoadEntitiesSelectors<Entity>,
        allConfigs
      ),
    initialState: ({
      previousInitialState,
      allConfigs,
    }: TraitInitialStateFactoryConfig) =>
      createSortInitialState<Entity>(previousInitialState, allConfigs),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createSortTraitReducer<Entity>(
        initialState,
        allActions as SortEntitiesActions<Entity> & LoadEntitiesActions<Entity>,
        allMutators,
        allConfigs as LoadEntitiesKeyedConfig<Entity> &
          EntitiesPaginationKeyedConfig &
          SortEntitiesKeyedConfig<Entity>
      ),
    effects: ({ allActions, allConfigs }) =>
      createSortTraitEffect(
        allActions as LoadEntitiesActions<Entity> &
          SortEntitiesActions<Entity> &
          EntitiesPaginationActions,
        allConfigs as LoadEntitiesKeyedConfig<Entity> &
          SortEntitiesKeyedConfig<Entity>
      ),
  });
}