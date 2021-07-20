import { createAction, props } from '@ngrx/store';
import { Sort, SortActions } from './sort.model';

export function createSortTraitActions<Entity>(
  actionsGroupKey: string
): SortActions<Entity> {
  return {
    sort: createAction(`${actionsGroupKey} sort`, props<Sort<Entity>>()),
    resetSort: createAction(`${actionsGroupKey} default sort`),
  };
}
