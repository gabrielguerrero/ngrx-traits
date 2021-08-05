import { LoadEntitiesActions } from './load-entities.model';
import { createAction, props } from '@ngrx/store';

export function createLoadEntitiesTraitActions<Entity>(
  actionsGroupKey: string
): LoadEntitiesActions<Entity> {
  const actions = {
    fetch: createAction(`${actionsGroupKey} Fetch Entities`),
    fetchSuccess: createAction(
      `${actionsGroupKey} Fetch Entities Success`,
      props<{ entities: Entity[]; total?: number }>()
    ),
    fetchFail: createAction(
      `${actionsGroupKey} Fetch Entities Fail`,
      (props?:{ error?: string })=> ({error: props?.error})
    ),
  };

  return actions;
}
