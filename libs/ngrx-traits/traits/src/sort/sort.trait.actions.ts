import { createAction, props } from '@ngrx/store';
import { Sort, SortEntitiesActions } from './sort.model';

export function createSortTraitActions<Entity>(
  actionsGroupKey: string
): SortEntitiesActions<Entity> {
  return {
    sortEntities: createAction(
      `${actionsGroupKey} sort`,
      props<Sort<Entity>>()
    ),
    resetEntitiesSort: createAction(`${actionsGroupKey} default sort`),
  };
}
