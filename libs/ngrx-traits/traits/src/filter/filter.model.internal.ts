import { ActionCreator, TypedAction } from '@ngrx/store/src/models';
import { FilterActions } from './filter.model';

/**
 * @internal
 */
export type ƟFilterActions<F> = FilterActions<F> & {
  storeFilter: ActionCreator<
    string,
    (props: {
      filters?: F;
      patch?: boolean;
    }) => { filters?: F; patch?: boolean } & TypedAction<string>
  >;
};
