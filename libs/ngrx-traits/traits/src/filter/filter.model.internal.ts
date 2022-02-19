import { ActionCreator, TypedAction } from '@ngrx/store/src/models';
import { FilterEntitiesActions } from './filter.model';

/**
 * @internal
 */
export type ƟFilterEntitiesActions<F> = FilterEntitiesActions<F> & {
  storeEntitiesFilter: ActionCreator<
    string,
    (props: {
      filters?: F;
      patch?: boolean;
    }) => { filters?: F; patch?: boolean } & TypedAction<string>
  >;
};
