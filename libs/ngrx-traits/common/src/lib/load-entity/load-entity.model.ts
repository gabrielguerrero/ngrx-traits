import { PostfixProps, PrefixProps, TraitActions } from '@ngrx-traits/core';
import {
  AsyncActionActions,
  AsyncActionState,
} from '../async-action/async-action.model';

export type LoadEntityActions<
  J extends string,
  Request extends object,
  Response extends object,
  Failure extends object
> = PrefixProps<AsyncActionActions<Request, Response, Failure, J>, 'load'> &
  TraitActions;

export type LoadEntityState<T, J extends string> = AsyncActionState<J> &
  PrefixProps<{ ''?: T }, J>;

export type LoadEntitySelectors<T, J extends string> = PostfixProps<
  {
    select: (state: LoadEntityState<T, J>) => T;
  },
  J
>;
