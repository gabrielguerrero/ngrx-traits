import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { PageInfoModel } from '@ngrx-traits/common';
import { ActionCreator, Selector, Store } from '@ngrx/store';
import { Action } from '@ngrx/store/src/models';
import { Observable, Subscription, withLatestFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

function getDataSource<T>({
  store,
  selectEntitiesList,
  selectEntitiesPageInfo,
  loadEntitiesNextPage,
}: {
  store: Store;
  selectEntitiesList: Selector<any, T[]>;
  selectEntitiesPageInfo: Selector<any, PageInfoModel>;
  loadEntitiesNextPage: ActionCreator<string, () => Action<string>>;
}) {
  class MyDataSource extends DataSource<T> {
    subscription?: Subscription;
    connect(collectionViewer: CollectionViewer): Observable<T[]> {
      this.subscription = collectionViewer.viewChange
        .pipe(
          withLatestFrom(store.select(selectEntitiesPageInfo)),
          filter(
            ([{ end, start }, { total, hasNext, pageIndex, pageSize }]) => {
              let endIndex = pageIndex * pageSize + pageSize;
              // filter first request that is done by the cdkscroll,
              // filter last request
              // only do requests when you pass a specific threshold
              return start != 0 && end <= total! && end >= endIndex;
            },
          ),
        )
        .subscribe(() => {
          store.dispatch(loadEntitiesNextPage());
        });
      return store.select(selectEntitiesList);
    }

    disconnect(collectionViewer: CollectionViewer): void {}
  }
  return new MyDataSource();
}
