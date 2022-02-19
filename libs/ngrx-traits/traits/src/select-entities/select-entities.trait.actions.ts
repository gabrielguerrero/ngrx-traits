import { createAction, props } from '@ngrx/store';
import { SelectEntitiesActions } from './select-entities.model';

export function createMultiSelectionTraitActions(
  actionsGroupKey: string
): SelectEntitiesActions {
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
