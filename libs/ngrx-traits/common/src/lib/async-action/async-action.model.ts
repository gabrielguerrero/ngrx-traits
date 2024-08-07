import { PostfixProps, PrefixProps } from '@ngrx-traits/core';
import { ActionCreator, NotAllowedCheck } from '@ngrx/store';
import { Action } from '@ngrx/store/src/models';

import { StatusState } from '../load-entities';

export type ActionCreatorWithOptionalProps<T> = T extends undefined
  ? ActionCreator<string, () => Action<string>>
  : ActionCreator<
      string,
      (props: T & NotAllowedCheck<T & object>) => T & Action<string>
    >;

type AsyncActions<Request, Response, Failure> = {
  '': ActionCreatorWithOptionalProps<Request>;
  Success: ActionCreatorWithOptionalProps<Response>;
  Fail: ActionCreatorWithOptionalProps<Failure>;
};

type StatusSelectors<S extends StatusState> = {
  isLoading: (state: S) => boolean;
  isSuccess: (state: S) => boolean;
  isFail: (state: S) => boolean;
};

export type AsyncActionState<J extends string> = PrefixProps<StatusState, J>;

export type AsyncActionSelectors<
  J extends string,
  S extends StatusState,
> = PostfixProps<StatusSelectors<S>, J>;

export type AsyncActionActions<
  Request,
  Response,
  Failure,
  J extends string,
> = PrefixProps<AsyncActions<Request, Response, Failure>, J>;
