import { LoadEntitiesActions } from './load-entities.model';
import { createAction, props } from '@ngrx/store';

export function createLoadEntitiesTraitActions<Entity>(
  actionsGroupKey: string
): LoadEntitiesActions<Entity> {
  const actions = {
    loadEntities: createAction(`${actionsGroupKey} loadEntities Entities`),
    loadEntitiesSuccess: createAction(
      `${actionsGroupKey} loadEntities Entities Success`,
      props<{ entities: Entity[]; total?: number }>()
    ),
    loadEntitiesFail: createAction(
      `${actionsGroupKey} loadEntities Entities Fail`,
      (props?: { error?: string }) => ({ error: props?.error })
    ),
  };

  return actions;
}
