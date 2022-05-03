# Caching

This is a very simple cache implementation inspired in some bits of react query like cache keys that are arrays of string or objects,
is not compulsory to use this library with the traits you could use any other cache library.

With this lib you can cache anything that returns an Observable, so it could be used to cache rest calls, grapql or grpc.

Examples 

#### Caching a response call indefinitely

```typescript

  loadStores$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(this.localActions.loadStores),
      exhaustMap(() =>
        cache({
          key: ['stores'],
          store: this.store,
          source: this.storeService.getStores(),
          // no expire param so is stored forever
        }).pipe(
          map((res) => this.localActions.loadStoresSuccess({ entities: res })),
          catchError(() => of(this.localActions.loadStoresFail()))
        )
      )
    );
  });

```

#### Caching for 10 mins

```typescript
  loadStores$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(this.localActions.loadStores),
      exhaustMap(() =>
        cache({
          key: ['stores'],
          store: this.store,
          source: this.storeService.getStores(),
          expires: 1000 * 60 * 3
        }).pipe(
          map((res) => this.localActions.loadStoresSuccess({ entities: res })),
          catchError(() => of(this.localActions.loadStoresFail()))
        )
      )
    );
  });
```

#### Cache top 10 queries 
```typescript
loadDepartments$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(this.localActions.loadDepartments),
      concatLatestFrom(() =>
        this.store.select(this.localSelectors.selectDepartmentsFilter)
      ),
      exhaustMap(([_, filters]) =>
        cache({
          // NOTE here is imporant the key is an array where the last param is used to store the querie params
          // because the strings before last param are use to group the queries
          // DONT DO key: [`stores`,{storeId: filters!.storeId},`departaments`], 
          // DO ↓
          key: [`stores`,`departaments`, {storeId: filters!.storeId}],
          store: this.store,
          source: this.storeService.getStoreDepartments(filters!.storeId),
          expires: 1000 * 60 * 3,
          maxCacheSize: 10,
        }).pipe(
          map((res) =>
            this.localActions.loadDepartmentsSuccess({
              entities: res,
            })
          ),
          catchError(() => of(this.localActions.loadDepartmentsFail()))
        )
      )
    );
  });
```

#### Invalidate queries

```typescript
this.store.dispatch(CacheActions.invalidateCache({key:['stores']}));
```
You can invalidate any queries regardless of the time left to expire and will get re-executed next time gets called,
If you invalidate using a key like ['stores'], all queries that begin with that key also get invalidated, e.g. a cache with a key like ['stores','departments', {storedId: 1}] will also be invalidated.

#### Delete queries

```typescript
this.store.dispatch(CacheActions.deleteCache({key:['stores']}));
```
You can delete any queries regardless of the time left to expire and will get re-executed next time gets called,
If you delete using a key like ['stores'], all queries that begin with that key also get deleted, e.g. a cache with a key like ['stores','departments', {storedId: 1}] will also be deleted.
