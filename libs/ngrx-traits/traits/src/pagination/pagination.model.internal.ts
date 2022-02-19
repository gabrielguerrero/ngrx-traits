import { ActionCreator, TypedAction } from '@ngrx/store/src/models';
import { EntitiesPaginationActions } from './pagination.model';

/**
 * @internal
 */
export type ƟPaginationActions = EntitiesPaginationActions & {
  setRequestPage: ActionCreator<
    string,
    (props: { index: number }) => { index: number } & TypedAction<string>
  >;
};
