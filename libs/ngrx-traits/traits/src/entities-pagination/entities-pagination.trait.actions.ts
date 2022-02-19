import { EntitiesPaginationActions } from './entities-pagination.model';
import { createAction, props } from '@ngrx/store';
import { ƟPaginationActions } from './entities-pagination.model.internal';

export function createPaginationTraitActions(
  actionsGroupKey: string
): EntitiesPaginationActions {
  const actions: ƟPaginationActions = {
    loadEntitiesPage: createAction(
      `${actionsGroupKey} load page`,
      ({ index, forceLoad }: { index: number; forceLoad?: boolean }) => ({
        index,
        forceLoad,
      })
    ),
    loadEntitiesPageSuccess: createAction(
      `${actionsGroupKey} load
          page success`
    ),
    loadEntitiesPageFail: createAction(`${actionsGroupKey} load page fail`),
    loadEntitiesPreviousPage: createAction(
      `${actionsGroupKey} load previous page`
    ),
    loadEntitiesNextPage: createAction(`${actionsGroupKey} load next page`),
    loadEntitiesFirstPage: createAction(
      `${actionsGroupKey} load first page`,
      (forceLoad?: boolean) => ({ forceLoad })
    ),
    loadEntitiesLastPage: createAction(`${actionsGroupKey} load last page`),
    clearEntitiesPagesCache: createAction(`${actionsGroupKey} clear cache`),
    setRequestPage: createAction(
      `${actionsGroupKey} set request page`,
      props<{ index: number }>()
    ),
  };
  return actions;
}
