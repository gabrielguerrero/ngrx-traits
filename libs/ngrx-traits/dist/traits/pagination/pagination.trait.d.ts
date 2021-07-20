import { PaginationConfig, PaginationSelectors } from './pagination.model';
export declare function addPagination<Entity>({
  cacheType,
  pageSize,
  currentPage,
  pagesToCache,
}?: PaginationConfig): import('../../../dist/model').TraitFactory<
  import('./pagination.model').EntityAndPaginationState<Entity>,
  import('./pagination.model').PaginationActions,
  PaginationSelectors<Entity>,
  import('../../../dist/model').TraitStateMutators<
    import('./pagination.model').EntityAndPaginationState<Entity>
  >,
  'pagination',
  PaginationConfig,
  import('../../../dist/model').AllTraitConfigs
>;
