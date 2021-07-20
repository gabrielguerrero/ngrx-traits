import { CrudActions, CrudConfig } from './crud.model';
export declare function addCrudEntities<Entity>({
  storeChanges,
}?: CrudConfig): import('../../../dist/model').TraitFactory<
  import('./crud.model').EntityAndCrudState<Entity>,
  CrudActions<Entity>,
  import('./crud.model').CrudSelectors<Entity>,
  import('./crud.model').CrudMutators<Entity>,
  'crud',
  CrudConfig,
  import('../../../dist/model').AllTraitConfigs
>;
