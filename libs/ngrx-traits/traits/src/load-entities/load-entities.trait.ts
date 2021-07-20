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
