import { PaginationActions } from './pagination.model';
import { createAction, props } from '@ngrx/store';
import { ƟPaginationActions } from './pagination.model.internal';

export function createPaginationTraitActions(
  actionsGroupKey: string
): PaginationActions {
  const actions: ƟPaginationActions = {
    loadPage: createAction(
      `${actionsGroupKey} load page`,
      ({ index, forceLoad }: { index: number; forceLoad?: boolean }) => ({
        index,
        forceLoad,
      })
    ),
    loadPageSuccess: createAction(
      `${actionsGroupKey} load
          page success`
    ),
    loadPageFail: createAction(`${actionsGroupKey} load page fail`),
    loadPreviousPage: createAction(`${actionsGroupKey} load previous page`),
    loadNextPage: createAction(`${actionsGroupKey} load next page`),
    loadFirstPage: createAction(
      `${actionsGroupKey} load first page`,
      (forceLoad?: boolean) => ({ forceLoad })
    ),
    loadLastPage: createAction(`${actionsGroupKey} load last page`),
    clearPagesCache: createAction(`${actionsGroupKey} clear cache`),
    setRequestPage: createAction(
      `${actionsGroupKey} set request page`,
      props<{ index: number }>()
    ),
  };
  return actions;
}
