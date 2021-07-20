import { FilterConfig, FilterSelectors } from './filter.model';
export declare function addFilter<Entity, F>({
  defaultDebounceTime,
  defaultFilter,
  filterFn,
}?: FilterConfig<Entity, F>): import('../../../dist/model').TraitFactory<
  import('./filter.model').EntityAndFilterState<Entity, F>,
  import('./filter.model').FilterActions<F>,
  FilterSelectors<Entity, F>,
  import('./filter.model').FilterMutators<Entity, F>,
  'filter',
  FilterConfig<Entity, F>,
  import('../../../dist/model').AllTraitConfigs
>;
