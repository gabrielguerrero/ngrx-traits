import { createAction, props } from '@ngrx/store';
import { Sort, SortActions } from './sort.model';

export function createSortTraitActions<Entity>(
  actionsGroupKey: string
): SortActions<Entity> {
  return {
    sortEntities: createAction(
      `${actionsGroupKey} sort`,
      props<Sort<Entity>>()
    ),
    resetEntitiesSort: createAction(`${actionsGroupKey} default sort`),
  };
}
