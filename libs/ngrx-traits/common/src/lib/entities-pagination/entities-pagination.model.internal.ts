import { ActionCreator, TypedAction } from '@ngrx/store/src/models';
import { EntitiesPaginationActions } from './entities-pagination.model';

/**
 * @internal
 */
export type ƟPaginationActions = EntitiesPaginationActions & {
  setEntitiesRequestPage: ActionCreator<
    string,
    (props: { index: number }) => { index: number } & TypedAction<string>
  >;
};
