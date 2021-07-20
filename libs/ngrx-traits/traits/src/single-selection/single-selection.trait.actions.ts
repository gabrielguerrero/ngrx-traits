import { createAction, props } from '@ngrx/store';
import { SingleSelectionActions } from './single-selection.model';

export function createSingleSelectionTraitActions(
  actionsGroupKey: string
): SingleSelectionActions {
  return {
    select: createAction(
      `${actionsGroupKey} Select`,
      props<{ id: string | number }>()
    ),
    deselect: createAction(`${actionsGroupKey} Deselect`),
    toggleSelect: createAction(
      `${actionsGroupKey} Toggle Select`,
      props<{ id: string | number }>()
    ),
  };
}
