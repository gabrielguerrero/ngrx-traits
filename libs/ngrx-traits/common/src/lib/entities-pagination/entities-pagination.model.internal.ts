import { ActionCreator, TypedAction } from '@ngrx/store/src/models';
import {
  EntitiesPaginationActions,
  EntitiesPaginationSelectors,
  EntitiesPaginationState,
} from './entities-pagination.model';
import { LoadEntitiesState } from '../load-entities/load-entities.model';

/**
 * @internal
 */
export type ƟPaginationActions = EntitiesPaginationActions & {
  setEntitiesRequestPage: ActionCreator<
    string,
    (props: { index: number }) => { index: number } & TypedAction<string>
  >;
};

/**
 * @internal
 */
export type ƟEntitiesPaginationSelectors<Entity> =
  EntitiesPaginationSelectors<Entity> & {
    isEntitiesCurrentPageInCache: (
      state: LoadEntitiesState<Entity> & EntitiesPaginationState
    ) => boolean;
    isEntitiesNextPageInCache: (
      state: LoadEntitiesState<Entity> & EntitiesPaginationState
    ) => boolean;
  };
