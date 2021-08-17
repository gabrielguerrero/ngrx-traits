import { createAction, props } from '@ngrx/store';
import { MultiSelectActions } from './multi-selection.model';

export function createMultiSelectionTraitActions(
  actionsGroupKey: string
): MultiSelectActions {
  return {
    multiSelect: createAction(
      `${actionsGroupKey} Multi Select`,
      props<{ id: number | string }>()
    ),
    multiDeselect: createAction(
      `${actionsGroupKey} Multi Deselect`,
      props<{ id: number | string }>()
    ),
    multiToggleSelect: createAction(
      `${actionsGroupKey} Multi Toggle Select`,
      props<{ id: number | string }>()
    ),
    toggleSelectAll: createAction(`${actionsGroupKey} Toggle Select All`),
    multiClearSelection: createAction(`${actionsGroupKey} Clear Selection`),
  };
}
