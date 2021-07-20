import { Injectable } from '@angular/core';
import { TraitEffect } from 'ngrx-traits';
import { concatMap, concatMapTo, filter, first, map } from 'rxjs/operators';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { FilterActions } from '../filter/filter.model';
import { LoadEntitiesActions, LoadEntitiesSelectors } from '../load-entities';
import { CrudActions } from '../crud/crud.model';
import { PaginationSelectors } from './pagination.model';
import { Type } from 'ngrx-traits';
import { ƟPaginationActions } from './pagination.model.internal';

export function createPaginationTraitEffects<Entity>(
  allActions: ƟPaginationActions &
    FilterActions<Entity> &
    LoadEntitiesActions<Entity> &
    CrudActions<Entity>,
  allSelectors: LoadEntitiesSelectors<Entity> & PaginationSelectors<Entity>
): Type<TraitEffect>[] {
  @Injectable()
  class PaginationEffect extends TraitEffect {
    loadPage$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.loadPage),
        concatLatestFrom(() => this.store.select(allSelectors.isPageInCache)),
        map(([{ forceLoad }, isInCache]) =>
          !forceLoad && isInCache
            ? allActions.loadPageSuccess()
            : allActions.fetch()
        )
      );
    });

    preloadNextPage$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.loadPageSuccess),
        concatMapTo(
          this.store.select(allSelectors.selectPageInfo).pipe(first())
        ),
        filter(
          (pageInfo) =>
            !!pageInfo.total &&
            pageInfo.hasNext &&
            pageInfo.cacheType !== 'full'
        ),
        concatMap((pageInfo) =>
          this.store
            .select(allSelectors.isPageInCache, {
              page: pageInfo.pageIndex + 1,
            })
            .pipe(
              first(),
              map((isInCache) => (!isInCache && pageInfo) || undefined)
            )
        ),
        filter((pageInfo) => !!pageInfo),
        concatMap((pageInfo) => [
          allActions.setRequestPage({ index: pageInfo!.pageIndex + 1 }),
          allActions.fetch(),
        ])
      );
    });

    loadFirstPage$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.loadFirstPage),
        map(() => allActions.loadPage({ index: 0 }))
      );
    });

    loadPreviousPage$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.loadPreviousPage),
        concatMapTo(
          this.store.select(allSelectors.selectPageInfo).pipe(first())
        ),
        map((page) =>
          page.hasPrevious
            ? allActions.loadPage({ index: page.pageIndex - 1 })
            : allActions.loadPageFail()
        )
      );
    });

    loadNextPage$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.loadNextPage),
        concatMapTo(
          this.store.select(allSelectors.selectPageInfo).pipe(first())
        ),
        map((page) =>
          page.hasNext
            ? allActions.loadPage({ index: page.pageIndex + 1 })
            : allActions.loadPageFail()
        )
      );
    });

    loadLastPage$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.loadLastPage),
        concatMapTo(
          this.store.select(allSelectors.selectPageInfo).pipe(first())
        ),
        map((page) =>
          page.hasNext && page.pagesCount
            ? allActions.loadPage({ index: page.pagesCount - 1 })
            : allActions.loadPageFail()
        )
      );
    });
  }
  return [PaginationEffect];
}
