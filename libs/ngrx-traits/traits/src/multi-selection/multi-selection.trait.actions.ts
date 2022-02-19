import { createAction, props } from '@ngrx/store';
import { MultiSelectActions } from './multi-selection.model';

export function createMultiSelectionTraitActions(
  actionsGroupKey: string
): MultiSelectActions {
  return {
    selectEntities: createAction(
      `${actionsGroupKey} Multi Select`,
      props<{ id: number | string }>()
    ),
    deselectEntities: createAction(
      `${actionsGroupKey} Multi Deselect`,
      props<{ id: number | string }>()
    ),
    toggleSelectEntities: createAction(
      `${actionsGroupKey} Multi Toggle Select`,
      props<{ id: number | string }>()
    ),
    toggleSelectAllEntities: createAction(
      `${actionsGroupKey} Toggle Select All`
    ),
    clearEntitiesSelection: createAction(`${actionsGroupKey} Clear Selection`),
  };
}
