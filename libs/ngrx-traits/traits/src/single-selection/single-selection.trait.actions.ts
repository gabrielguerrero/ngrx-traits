import { createAction, props } from '@ngrx/store';
import { SingleSelectionActions } from './single-selection.model';

export function createSingleSelectionTraitActions(
  actionsGroupKey: string
): SingleSelectionActions {
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
