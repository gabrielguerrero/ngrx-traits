import { createAction, props } from '@ngrx/store';
import { Sort, SortEntitiesActions } from './sort-entities.model';

export function createSortTraitActions<Entity>(
  actionsGroupKey: string,
  entitiesName: string
): SortEntitiesActions<Entity> {
  return {
    sortEntities: createAction(
      `${actionsGroupKey} Sort ${entitiesName}`,
      props<Sort<Entity>>()
    ),
    resetEntitiesSort: createAction(
      `${actionsGroupKey} Reset ${entitiesName} Sort`
    ),
  };
}
