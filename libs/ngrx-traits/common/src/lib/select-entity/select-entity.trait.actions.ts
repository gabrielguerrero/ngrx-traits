import { createAction, props } from '@ngrx/store';
import { SelectEntityActions } from './select-entity.model';

export function createSelectEntityTraitActions(
  actionsGroupKey: string,
  entityName: string
): SelectEntityActions {
  return {
    selectEntity: createAction(
      `${actionsGroupKey} Select ${entityName}`,
      props<{ id: string | number }>()
    ),
    deselectEntity: createAction(`${actionsGroupKey} Deselect ${entityName}`),
    toggleSelectEntity: createAction(
      `${actionsGroupKey} Toggle Select ${entityName}`,
      props<{ id: string | number }>()
    ),
  };
}
