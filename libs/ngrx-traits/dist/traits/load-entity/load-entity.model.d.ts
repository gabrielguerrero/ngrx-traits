import { PostfixProps, PrefixProps, TraitActions } from 'ngrx-traits';
import {
  AsyncActionActions,
  AsyncActionState,
} from '../async-action/async-action.model';
export declare type LoadEntityActions<
  J extends string,
  Request extends object,
  Response extends object,
  Failure extends object
> = PrefixProps<AsyncActionActions<Request, Response, Failure, J>, 'load'> &
  TraitActions;
export declare type LoadEntityState<
  T,
  J extends string
> = AsyncActionState<`load${Capitalize<J & string>}`> &
  PrefixProps<
    {
      ''?: T;
    },
    J
  >;
export declare type LoadEntitySelectors<T, J extends string> = PostfixProps<
  {
    select: (state: LoadEntityState<T, J>) => T;
  },
  J
>;
