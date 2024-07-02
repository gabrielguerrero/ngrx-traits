import { Action, ActionCreator } from '@ngrx/store/src/models';

import { LoadEntitiesState } from '../load-entities/load-entities.model';
import {
  EntitiesPaginationActions,
  EntitiesPaginationSelectors,
  EntitiesPaginationState,
} from './entities-pagination.model';

/**
 * @internal
 */
export type ƟPaginationActions = EntitiesPaginationActions & {
  setEntitiesRequestPage: ActionCreator<
    string,
    (props: { index: number }) => { index: number } & Action<string>
  >;
};

/**
 * @internal
 */
export type ƟEntitiesPaginationSelectors<Entity> =
  EntitiesPaginationSelectors<Entity> & {
    isEntitiesCurrentPageInCache: (
      state: LoadEntitiesState<Entity> & EntitiesPaginationState,
    ) => boolean;
    isEntitiesNextPageInCache: (
      state: LoadEntitiesState<Entity> & EntitiesPaginationState,
    ) => boolean;
  };
