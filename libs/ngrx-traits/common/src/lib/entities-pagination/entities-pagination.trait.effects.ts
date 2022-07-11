import { Injectable } from '@angular/core';
import { TraitEffect } from '@ngrx-traits/core';
import {
  concatMap,
  concatMapTo,
  filter,
  first,
  map,
  tap,
} from 'rxjs/operators';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { FilterEntitiesActions } from '../filter-entities/filter-entities.model';
import { LoadEntitiesActions, LoadEntitiesSelectors } from '../load-entities';
import { CrudEntitiesActions } from '../crud-entities/crud-entities.model';
import { EntitiesPaginationSelectors } from './entities-pagination.model';
import { Type } from '@ngrx-traits/core';
import {
  ƟEntitiesPaginationSelectors,
  ƟPaginationActions,
} from './entities-pagination.model.internal';

export function createPaginationTraitEffects<Entity>(
  allActions: ƟPaginationActions &
    FilterEntitiesActions<Entity> &
    LoadEntitiesActions<Entity> &
    CrudEntitiesActions<Entity>,
  allSelectors: LoadEntitiesSelectors<Entity> &
    EntitiesPaginationSelectors<Entity>
): Type<TraitEffect>[] {
  @Injectable()
  class PaginationEffect extends TraitEffect {
    loadPage$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.loadEntitiesPage),
        concatLatestFrom(() =>
          this.store.select(
            (allSelectors as unknown as ƟEntitiesPaginationSelectors<Entity>)
              .isEntitiesCurrentPageInCache
          )
        ),
        map(([{ forceLoad }, isInCache]) =>
          !forceLoad && isInCache
            ? allActions.loadEntitiesPageSuccess()
            : allActions.loadEntities()
        )
      );
    });

    preloadNextPage$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.loadEntitiesPageSuccess),
        concatMapTo(
          this.store
            .select(allSelectors.selectEntitiesCurrentPageInfo)
            .pipe(first())
        ),
        tap(console.log),
        filter(
          (pageInfo) =>
            !!pageInfo.total &&
            pageInfo.hasNext &&
            pageInfo.cacheType !== 'full'
        ),
        concatMap((pageInfo) =>
          this.store
            .select(
              (allSelectors as unknown as ƟEntitiesPaginationSelectors<Entity>)
                .isEntitiesNextPageInCache
            )
            .pipe(
              first(),
              map((isInCache) => (!isInCache && pageInfo) || undefined)
            )
        ),
        tap(console.log),
        filter((pageInfo) => !!pageInfo),
        concatMap((pageInfo) => [
          allActions.setEntitiesRequestPage({ index: pageInfo!.pageIndex + 1 }),
          allActions.loadEntities(),
        ])
      );
    });

    loadFirstPage$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.loadEntitiesFirstPage),
        map(() => allActions.loadEntitiesPage({ index: 0 }))
      );
    });

    loadPreviousPage$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.loadEntitiesPreviousPage),
        concatMapTo(
          this.store
            .select(allSelectors.selectEntitiesCurrentPageInfo)
            .pipe(first())
        ),
        map((page) =>
          page.hasPrevious
            ? allActions.loadEntitiesPage({ index: page.pageIndex - 1 })
            : allActions.loadEntitiesPageFail()
        )
      );
    });

    loadNextPage$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.loadEntitiesNextPage),
        concatMapTo(
          this.store
            .select(allSelectors.selectEntitiesCurrentPageInfo)
            .pipe(first())
        ),
        map((page) =>
          page.hasNext
            ? allActions.loadEntitiesPage({ index: page.pageIndex + 1 })
            : allActions.loadEntitiesPageFail()
        )
      );
    });

    loadLastPage$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.loadEntitiesLastPage),
        concatMapTo(
          this.store
            .select(allSelectors.selectEntitiesCurrentPageInfo)
            .pipe(first())
        ),
        map((page) =>
          page.hasNext && page.pagesCount
            ? allActions.loadEntitiesPage({ index: page.pagesCount - 1 })
            : allActions.loadEntitiesPageFail()
        )
      );
    });
  }
  return [PaginationEffect];
}
