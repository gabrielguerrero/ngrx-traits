import { createAction, props } from '@ngrx/store';
import { SelectEntitiesActions } from './select-entities.model';

export function createSelectEntitiesTraitActions(
  actionsGroupKey: string,
  entitiesName: string
): SelectEntitiesActions {
  return {
    selectEntities: createAction(
      `${actionsGroupKey} Select ${entitiesName}`,
      props<{ id: number | string }>()
    ),
    deselectEntities: createAction(
      `${actionsGroupKey} Deselect ${entitiesName}`,
      props<{ id: number | string }>()
    ),
    toggleSelectEntities: createAction(
      `${actionsGroupKey} Toggle Select ${entitiesName}`,
      props<{ id: number | string }>()
    ),
    toggleSelectAllEntities: createAction(
      `${actionsGroupKey} Toggle Select All ${entitiesName}`
    ),
    clearEntitiesSelection: createAction(
      `${actionsGroupKey} Clear ${entitiesName} Selection`
    ),
  };
}
