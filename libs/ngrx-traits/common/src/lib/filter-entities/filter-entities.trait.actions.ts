import { createAction } from '@ngrx/store';
import {
  FilterActionOverload,
  FilterEntitiesActions,
} from './filter-entities.model';
import { ActionCreator } from '@ngrx/store/src/models';
import { ƟFilterEntitiesActions } from './filter-entities.model.internal';

export function createFilterTraitActions<F>(
  actionsGroupKey: string,
  entitiesName: string
): FilterEntitiesActions<F> {
  const actions: ƟFilterEntitiesActions<F> = {
    filterEntities: createAction(
      `${actionsGroupKey} Filter ${entitiesName}`,
      (props?: {
        filters: F | Partial<F>;
        forceLoad?: boolean;
        patch?: boolean;
      }) => ({
        filters: props?.filters,
        forceLoad: props?.forceLoad,
        patch: props?.patch,
      })
    ) as ActionCreator<string, FilterActionOverload<F>>,
    storeEntitiesFilter: createAction(
      `${actionsGroupKey} Store ${entitiesName} Filter`,
      (props: { filters?: F; patch?: boolean }) => ({
        filters: props?.filters,
        patch: props?.patch,
      })
    ),
  };
  return actions;
}
