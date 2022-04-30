import { LoadEntitiesActions } from './load-entities.model';
import { createAction, props } from '@ngrx/store';

export function createLoadEntitiesTraitActions<Entity>(
  actionsGroupKey: string,
  entitiesName: string
): LoadEntitiesActions<Entity> {
  const actions = {
    loadEntities: createAction(`${actionsGroupKey} Load ${entitiesName}`),
    loadEntitiesSuccess: createAction(
      `${actionsGroupKey} Load ${entitiesName} Success`,
      props<{ entities: Entity[]; total?: number }>()
    ),
    loadEntitiesFail: createAction(
      `${actionsGroupKey} Load ${entitiesName} Fail`,
      (props?: { error?: string }) => ({ error: props?.error })
    ),
  };

  return actions;
}
