import { PostfixProps, PrefixProps, ReplaceProps } from '@ngrx-traits/core';
import { ActionCreator, NotAllowedCheck } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { StatusState } from '../load-entities';

export type ActionCreatorWithOptionalProps<T> = T extends undefined
  ? ActionCreator<string, () => TypedAction<string>>
  : ActionCreator<
      string,
      (props: T & NotAllowedCheck<T & object>) => T & TypedAction<string>
    >;

type AsyncActions<Request, Response, Failure> = {
  '': ActionCreatorWithOptionalProps<Request>;
  Success: ActionCreatorWithOptionalProps<Response>;
  Fail: ActionCreatorWithOptionalProps<Failure>;
};

type StatusSelectors<S extends StatusState> = {
  isActionNameLoading: (state: S) => boolean;
  isActionNameSuccess: (state: S) => boolean;
  isActionNameFail: (state: S) => boolean;
};

export type AsyncActionState<J extends string> = PrefixProps<StatusState, J>;

export type AsyncActionSelectors<J extends string, S> = ReplaceProps<
  StatusSelectors<S>,
  'ActionName',
  J
>;

export type AsyncActionActions<
  Request,
  Response,
  Failure,
  J extends string
> = PrefixProps<AsyncActions<Request, Response, Failure>, J>;
