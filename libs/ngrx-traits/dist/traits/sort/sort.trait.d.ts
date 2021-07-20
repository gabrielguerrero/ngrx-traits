import { SortActions, SortConfig, SortSelectors } from './sort.model';
export declare function addSort<Entity>({
  remote,
  defaultSort,
}?: SortConfig<Entity>): import('../../../dist/model').TraitFactory<
  import('./sort.model').EntityAndSortState<Entity>,
  SortActions<Entity>,
  SortSelectors<Entity>,
  import('./sort.model').SortMutators<Entity>,
  'sort',
  SortConfig<Entity>,
  import('../../../dist/model').AllTraitConfigs
>;
