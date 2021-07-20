import { createAction } from '@ngrx/store';
import { FilterActionOverload, FilterActions } from './filter.model';
import { ActionCreator } from '@ngrx/store/src/models';
import { ƟFilterActions } from './filter.model.internal';

export function createFilterTraitActions<F>(
  actionsGroupKey: string
): FilterActions<F> {
  const actions: ƟFilterActions<F> = {
    filter: createAction(
      `${actionsGroupKey} filter`,
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
    storeFilter: createAction(
      `${actionsGroupKey} store filter`,
      (props: { filters?: F; patch?: boolean }) => ({
        filters: props?.filters,
        patch: props?.patch,
      })
    ),
  };
  return actions;
}
