import { createAction, props } from '@ngrx/store';
import { SelectEntityActions } from './single-selection.model';

export function createSingleSelectionTraitActions(
  actionsGroupKey: string
): SelectEntityActions {
  return {
    selectEntity: createAction(
      `${actionsGroupKey} Select`,
      props<{ id: string | number }>()
    ),
    deselectEntity: createAction(`${actionsGroupKey} Deselect`),
    toggleSelectEntity: createAction(
      `${actionsGroupKey} Toggle Select`,
      props<{ id: string | number }>()
    ),
  };
}
