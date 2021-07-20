import { PostfixProps, PrefixProps } from 'ngrx-traits';
import { ActionCreator, NotAllowedCheck } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { StatusState } from '../load-entities';
export declare type ActionCreatorWithOptionalProps<T> = T extends undefined
  ? ActionCreator<string, () => TypedAction<string>>
  : ActionCreator<
      string,
      (props: T & NotAllowedCheck<T & object>) => T & TypedAction<string>
    >;
declare type AsyncActions<Request, Response, Failure> = {
  '': ActionCreatorWithOptionalProps<Request>;
  Success: ActionCreatorWithOptionalProps<Response>;
  Fail: ActionCreatorWithOptionalProps<Failure>;
};
declare type StatusSelectors<S extends StatusState> = {
  isLoading: (state: S) => boolean;
  isSuccess: (state: S) => boolean;
  isFail: (state: S) => boolean;
};
export declare type AsyncActionState<J extends string> = PrefixProps<
  StatusState,
  J
>;
export declare type AsyncActionSelectors<J extends string, S> = PostfixProps<
  StatusSelectors<S>,
  J
>;
export declare type AsyncActionActions<
  Request,
  Response,
  Failure,
  J extends string
> = PrefixProps<AsyncActions<Request, Response, Failure>, J>;
export {};
