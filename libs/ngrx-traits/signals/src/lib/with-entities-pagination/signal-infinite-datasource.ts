import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { PageInfoModel } from '@ngrx-traits/common';
import {
  getWithEntitiesKeys,
  InfinitePaginationState,
} from '@ngrx-traits/signals';
import type {
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import { ActionCreator, Selector, Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { Observable, Subscription, withLatestFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

import {
  EntitiesPaginationInfiniteMethods,
  NamedEntitiesPaginationInfiniteMethods,
} from '../../../../../../libs/ngrx-traits/signals/src/lib/with-entities-pagination/with-entities-infinite-pagination';
import { getWithEntitiesInfinitePaginationKeys } from '../../../../../../libs/ngrx-traits/signals/src/lib/with-entities-pagination/with-entities-infinite-pagination.util';

export function getInfiniteScrollDataSource<Entity, Collection extends string>(
  options:
    | {
        store: EntitySignals<Entity> &
          EntitiesPaginationInfiniteMethods<Entity>;
      }
    | {
        collection: Collection;
        store: NamedEntitySignals<Entity, Collection> &
          NamedEntitiesPaginationInfiniteMethods<Entity, Collection>;
      },
) {
  const collection = 'collection' in options ? options.collection : undefined;
  const { loadEntitiesNextPageKey, paginationKey } =
    getWithEntitiesInfinitePaginationKeys({
      collection,
    });
  const { entitiesKey } = getWithEntitiesKeys({ collection });
  const store = options.store as Record<string, unknown>;
  const entities = store[entitiesKey] as Signal<Entity[]>;
  const pagination = store[paginationKey] as Signal<InfinitePaginationState>;
  const loadEntitiesNextPage = store[loadEntitiesNextPageKey] as () => void;

  class MyDataSource extends DataSource<Entity> {
    subscription?: Subscription;
    entitiesList = toObservable(entities);
    connect(collectionViewer: CollectionViewer): Observable<Entity[]> {
      this.subscription = collectionViewer.viewChange
        .pipe(
          filter(({ end, start }) => {
            const { pageSize, total, cache } = pagination();
            // filter first request that is done by the cdkscroll,
            // filter last request
            // only do requests when you pass a specific threshold
            return start != 0 && end <= total! && end + pageSize >= cache.end;
          }),
        )
        .subscribe(() => {
          loadEntitiesNextPage();
        });
      return this.entitiesList;
    }

    disconnect(): void {
      this.subscription?.unsubscribe();
    }
  }
  return new MyDataSource();
}
