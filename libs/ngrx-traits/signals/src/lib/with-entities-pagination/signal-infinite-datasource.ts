import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import type {
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import { debounceTime, Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { getWithEntitiesKeys } from '../util';
import {
  EntitiesScrollPaginationMethods,
  NamedEntitiesScrollPaginationMethods,
  ScrollPaginationState,
} from './with-entities-remote-scroll-pagination.model';
import { getWithEntitiesInfinitePaginationKeys } from './with-entities-remote-scroll-pagination.util';

export function getInfiniteScrollDataSource<Entity, Collection extends string>(
  options:
    | {
        store: EntitySignals<Entity> & EntitiesScrollPaginationMethods<Entity>;
        debounceLoadMoreTime?: number;
      }
    | {
        collection: Collection;
        entity: Entity;
        store: NamedEntitySignals<Entity, Collection> &
          NamedEntitiesScrollPaginationMethods<Entity, Collection>;
        debounceLoadMoreTime?: number;
      },
) {
  const collection = 'collection' in options ? options.collection : undefined;
  const debounceLoadMoreTime = options.debounceLoadMoreTime ?? 300;
  const { loadMoreEntitiesKey, paginationKey } =
    getWithEntitiesInfinitePaginationKeys({
      collection,
    });
  const { entitiesKey } = getWithEntitiesKeys({ collection });
  const store = options.store as Record<string, unknown>;
  const entities = store[entitiesKey] as Signal<Entity[]>;
  const pagination = store[paginationKey] as Signal<ScrollPaginationState>;
  const loadMoreEntities = store[loadMoreEntitiesKey] as () => void;

  class MyDataSource extends DataSource<Entity> {
    subscription?: Subscription;
    entitiesList = toObservable(entities);
    connect(collectionViewer: CollectionViewer): Observable<Entity[]> {
      this.subscription = collectionViewer.viewChange
        .pipe(
          filter(({ end, start }) => {
            const { pageSize, hasMore } = pagination();
            return start != 0 && hasMore && end + pageSize >= entities().length;
          }),
          debounceTime(debounceLoadMoreTime),
        )
        .subscribe(() => {
          loadMoreEntities();
        });
      return this.entitiesList;
    }

    disconnect(): void {
      this.subscription?.unsubscribe();
    }
  }
  return new MyDataSource();
}
