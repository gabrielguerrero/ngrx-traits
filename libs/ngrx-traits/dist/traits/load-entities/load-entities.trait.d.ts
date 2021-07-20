import {
  EntityAndStatusState,
  LoadEntitiesConfig,
} from './load-entities.model';
export declare function addLoadEntities<Entity>(
  traitConfig?: Omit<LoadEntitiesConfig<Entity>, 'adapter'>
): import('../../../dist/model').TraitFactory<
  EntityAndStatusState<Entity>,
  import('./load-entities.model').LoadEntitiesActions<Entity>,
  import('./load-entities.model').LoadEntitiesSelectors<Entity>,
  import('./load-entities.model').LoadEntitiesMutators<Entity>,
  'loadEntities',
  LoadEntitiesConfig<Entity>,
  import('../../../dist/model').AllTraitConfigs
>;
