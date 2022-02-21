import { EntitiesPaginationActions } from './entities-pagination.model';
import { createAction, props } from '@ngrx/store';
import { ƟPaginationActions } from './entities-pagination.model.internal';

export function createPaginationTraitActions(
  actionsGroupKey: string,
  entitiesName: string
): EntitiesPaginationActions {
  const actions: ƟPaginationActions = {
    loadEntitiesPage: createAction(
      `${actionsGroupKey} Load ${entitiesName} Page`,
      ({ index, forceLoad }: { index: number; forceLoad?: boolean }) => ({
        index,
        forceLoad,
      })
    ),
    loadEntitiesPageSuccess: createAction(
      `${actionsGroupKey} Load  ${entitiesName}
          Page Success`
    ),
    loadEntitiesPageFail: createAction(
      `${actionsGroupKey} Load ${entitiesName} Page Fail`
    ),
    loadEntitiesPreviousPage: createAction(
      `${actionsGroupKey} Load Previous ${entitiesName} Page`
    ),
    loadEntitiesNextPage: createAction(
      `${actionsGroupKey} Load Next ${entitiesName} Page`
    ),
    loadEntitiesFirstPage: createAction(
      `${actionsGroupKey} Load First ${entitiesName} Page`,
      (forceLoad?: boolean) => ({ forceLoad })
    ),
    loadEntitiesLastPage: createAction(
      `${actionsGroupKey} Load Last ${entitiesName} Page`
    ),
    clearEntitiesPagesCache: createAction(
      `${actionsGroupKey} Clear ${entitiesName} Cache`
    ),
    setEntitiesRequestPage: createAction(
      `${actionsGroupKey} Set ${entitiesName} Request Page`,
      props<{ index: number }>()
    ),
  };
  return actions;
}
