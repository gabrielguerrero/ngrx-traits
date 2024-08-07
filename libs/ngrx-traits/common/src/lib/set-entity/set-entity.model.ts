import { PostfixProps } from '@ngrx-traits/core';
import { Action } from '@ngrx/store';
import { ActionCreator } from '@ngrx/store/src/models';

type SetActions<T> = {
  /**
   * set entity in the store
   */
  set: ActionCreator<string, (props: T) => Action<string>>;
};
export type SetEntityActions<Entity, J extends string> = PostfixProps<
  SetActions<Entity>,
  J
>;

export type SetEntityState<Entity, J extends string> = {
  [key in `${J}`]?: Entity;
};

export type SetEntitySelectors<Entity, J extends string> = PostfixProps<
  {
    select: (state: SetEntityState<Entity, J>) => Entity;
  },
  J
>;
