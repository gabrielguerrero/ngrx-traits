import { ActionCreator, TypedAction } from '@ngrx/store/src/models';
import { PaginationActions } from './pagination.model';
/**
 * @internal
 */
export declare type ƟPaginationActions = PaginationActions & {
  setRequestPage: ActionCreator<
    string,
    (props: { index: number }) => {
      index: number;
    } & TypedAction<string>
  >;
};
