import {
  createTraitFactory,
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
  TraitSelectorsFactoryConfig,
  TraitStateMutatorsFactoryConfig,
} from 'ngrx-traits';
import { createCrudTraitActions } from '../crud/crud.trait.actions';
import { createCrudTraitSelectors } from '../crud/crud.trait.selectors';
import {
  createCrudInitialState,
  createCrudTraitReducer,
} from '../crud/crud.trait.reducer';
import { SortActions, SortKeyedConfig } from '../sort/sort.model';
import {
  CrudActions,
  CrudConfig,
  CrudKeyedConfig,
  crudTraitKey,
} from './crud.model';
import { FilterActions, FilterKeyedConfig } from '../filter/filter.model';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesSelectors,
  loadEntitiesTraitKey,
} from '../load-entities/load-entities.model';
import {
  PaginationActions,
  PaginationKeyedConfig,
} from '../pagination/pagination.model';
import { createCrudTraitMutators } from './crud.trait.mutators';

export function addCrudEntities<Entity>({
  storeChanges = false,
}: CrudConfig = {}) {
  return createTraitFactory({
    key: crudTraitKey,
    depends: [loadEntitiesTraitKey],
    config: { storeChanges } as CrudConfig,
    actions: ({ actionsGroupKey }: TraitActionsFactoryConfig) =>
      createCrudTraitActions<Entity>(actionsGroupKey),
    selectors: ({ previousSelectors }: TraitSelectorsFactoryConfig) =>
      createCrudTraitSelectors<Entity>(
        previousSelectors as LoadEntitiesSelectors<Entity>
      ),
    mutators: ({ allConfigs }: TraitStateMutatorsFactoryConfig) =>
      createCrudTraitMutators<Entity>(
        allConfigs as CrudKeyedConfig & LoadEntitiesKeyedConfig<Entity>
      ),
    initialState: ({ previousInitialState }: TraitInitialStateFactoryConfig) =>
      createCrudInitialState<Entity>(previousInitialState),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createCrudTraitReducer(
        initialState,
        allActions as CrudActions<Entity> &
          LoadEntitiesActions<Entity> &
          SortActions<Entity> &
          FilterActions<any> &
          PaginationActions,
        allMutators,
        allConfigs as CrudKeyedConfig &
          FilterKeyedConfig<Entity, unknown> &
          LoadEntitiesKeyedConfig<Entity> &
          SortKeyedConfig<Entity> &
          PaginationKeyedConfig
      ),
  });
}
