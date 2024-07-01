import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  createTraitFactory,
  TraitActionsFactoryConfig,
  TraitEffect,
} from '@ngrx-traits/core';
import { createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { createAction, createReducer, on, props } from '@ngrx/store';
import { Action, ActionCreator } from '@ngrx/store/src/models';
import { delay, map, mapTo, tap } from 'rxjs/operators';

import {
  EntitiesPaginationActions,
  EntitiesPaginationMutators,
  entitiesPaginationTraitKey,
} from '../entities-pagination';
import {
  FilterEntitiesActions,
  FilterEntitiesMutators,
  filterEntitiesTraitKey,
} from '../filter-entities';
import { LoadEntitiesActions } from '../load-entities';
import {
  SortEntitiesActions,
  SortEntitiesMutators,
  sortTraitKey,
} from '../sort-entities';

/**
 * Generates ngrx code necessary to load and set to the current route query params for the filter, sort and paging traits
 *
 * @example
 *
 *    const traits = createEntityFeatureFactory(
 *      {entityName: 'Todo'},
 *      addLoadEntitiesTrait<Todo>(),
 *      addFilterEntitiesTrait(),
 *      addSortEntitiesTrait<Todo>({
 *        remote: true,
 *        defaultSort: {active:'id', direction:'asc'}
 *      })
 *      addEntitiesPaginationTrait<Todo>(),
 *      addEntitiesSyncToRouteQueryParams()
 *    )({
 *      actionsGroupKey: '[Todos]',
 *      featureSelector: createFeatureSelector<TestState>>(
 *        'todos',
 *      ),
 *    });
 *
 *
 * // generated actions
 * traits.actions.loadTodosUsingRouteQueryParams()
 */
export function addEntitiesSyncToRouteQueryParams() {
  let setEntitiesRouteQueryParams: ActionCreator<
    string,
    (props: { params: any }) => { params: any } & Action<string>
  >;
  return createTraitFactory({
    key: 'entitiesSyncToRouteQueryParams',
    depends: [entitiesPaginationTraitKey, sortTraitKey, filterEntitiesTraitKey],
    actions({ actionsGroupKey, entitiesName }: TraitActionsFactoryConfig) {
      const actions = {
        loadEntitiesUsingRouteQueryParams: createAction(
          `${actionsGroupKey} Load ${entitiesName} Using Route Query Params`,
        ),
      };
      setEntitiesRouteQueryParams = createAction(
        `${actionsGroupKey} Set ${entitiesName} Route Query Params`,
        props<{ params: any }>(),
      );
      return { ...actions, setEntitiesRouteQueryParams } as typeof actions;
    },
    reducer({ initialState, allMutators: m }) {
      const allMutators = m as EntitiesPaginationMutators<any> &
        FilterEntitiesMutators<any, any> &
        SortEntitiesMutators<any>;
      return createReducer(
        initialState,
        on(setEntitiesRouteQueryParams, (state, { params: p }) => {
          const params = { ...p };
          let newState = state;
          if (params.page) {
            newState = allMutators.setEntitiesPage(
              newState as any,
              +params.page,
            );
            delete params.page;
          }
          if (params.sortActive) {
            newState = allMutators.sortEntities(
              {
                active: params.sortActive,
                direction: params.sortDirection,
              },
              newState as any,
            );
            delete params.sortActive;
            delete params.sortDirection;
          }
          if (Object.keys(params).length) {
            newState = allMutators.setEntitiesFilters(params, newState as any);
          }

          return newState;
        }),
      );
    },
    effects({ allActions: a }) {
      const allActions = a as typeof a &
        FilterEntitiesActions<any> &
        SortEntitiesActions<any> &
        EntitiesPaginationActions;

      @Injectable()
      class SyncEntitiesStateToUrlEffect extends TraitEffect {
        activatedRoute = inject(ActivatedRoute);
        router = inject(Router);

        loadUrlParams$ = createEffect(() => {
          return this.actions$.pipe(
            ofType(allActions.loadEntitiesUsingRouteQueryParams),
            concatLatestFrom(() => this.activatedRoute.queryParams),
            map(([_, params]) => setEntitiesRouteQueryParams({ params })),
          );
        });

        setUrlParams$ = createEffect(() => {
          return this.actions$.pipe(
            ofType(setEntitiesRouteQueryParams),
            mapTo(
              (
                allActions as unknown as LoadEntitiesActions<any>
              ).loadEntities(),
            ),
          );
        });

        onFilter$ =
          !!allActions.filterEntities &&
          createEffect(
            () => {
              return this.actions$.pipe(
                ofType(allActions.filterEntities),
                tap(({ filters }) => {
                  this.updateUrl(filters);
                }),
              );
            },
            { dispatch: false },
          );

        onSort$ =
          !!allActions.sortEntities &&
          createEffect(
            () => {
              return this.actions$.pipe(
                ofType(allActions.sortEntities),
                delay(0),
                tap(({ active, direction }) => {
                  this.updateUrl({
                    sortActive: active,
                    sortDirection: direction,
                  });
                }),
              );
            },
            { dispatch: false },
          );

        onPaginate$ =
          !!allActions.loadEntitiesPage &&
          createEffect(
            () => {
              return this.actions$.pipe(
                ofType(allActions.loadEntitiesPage),
                tap(({ index }) => {
                  this.updateUrl({
                    page: index,
                  });
                }),
              );
            },
            { dispatch: false },
          );

        updateUrl(queryParams: any) {
          this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams,
            queryParamsHandling: 'merge', // remove to replace all query params by provided
          });
        }
      }
      return [SyncEntitiesStateToUrlEffect];
    },
  });
}
