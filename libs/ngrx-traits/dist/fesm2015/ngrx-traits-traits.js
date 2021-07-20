import {
  createReducer,
  on,
  createAction,
  props,
  createSelector,
} from '@ngrx/store';
import { insertIf, createTraitFactory, TraitEffect, toMap } from 'ngrx-traits';
import { createEntityAdapter } from '@ngrx/entity';
import { Injectable } from '@angular/core';
import { asyncScheduler, EMPTY, timer, of } from 'rxjs';
import {
  debounce,
  concatMap,
  first,
  map,
  distinctUntilChanged,
  concatMapTo,
  filter,
  mapTo,
} from 'rxjs/operators';
import { createEffect, ofType, concatLatestFrom } from '@ngrx/effects';
import { __rest } from 'tslib';
import { _isNumberValue } from '@angular/cdk/coercion';

const loadEntitiesTraitKey = 'loadEntities';

function createLoadEntitiesInitialState(previousInitialState = {}, allConfigs) {
  const traitConfig = allConfigs.loadEntities;
  const adapter = traitConfig.adapter;
  return Object.assign(
    Object.assign(
      Object.assign({}, previousInitialState),
      adapter.getInitialState()
    ),
    { status: undefined }
  );
}
function createLoadEntitiesTraitReducer(
  initialState,
  actions,
  allMutators,
  allConfigs
) {
  const handleEntitiesMerge = !(allConfigs === null || allConfigs === void 0
    ? void 0
    : allConfigs.pagination);
  return createReducer(
    initialState,
    on(actions.fetch, (state) =>
      Object.assign(Object.assign({}, state), { status: 'loading' })
    ),
    on(actions.fetchFail, (state) =>
      Object.assign(Object.assign({}, state), { status: 'fail' })
    ),
    on(actions.fetchSuccess, (state) =>
      Object.assign(Object.assign({}, state), { status: 'success' })
    ),
    ...insertIf(handleEntitiesMerge, () =>
      on(actions.fetchSuccess, (state, { entities }) =>
        allMutators.setAll(entities, Object.assign({}, state))
      )
    )
  );
}

function createLoadEntitiesTraitMutators(allConfigs) {
  var _a;
  const adapter =
    (_a =
      allConfigs === null || allConfigs === void 0
        ? void 0
        : allConfigs.loadEntities) === null || _a === void 0
      ? void 0
      : _a.adapter;
  return {
    setAll: adapter === null || adapter === void 0 ? void 0 : adapter.setAll,
  };
}

function createLoadEntitiesTraitActions(actionsGroupKey) {
  const actions = {
    fetch: createAction(`${actionsGroupKey} Fetch Entities`),
    fetchSuccess: createAction(
      `${actionsGroupKey} Fetch Entities Success`,
      props()
    ),
    fetchFail: createAction(`${actionsGroupKey} Fetch Entities Fail`, props()),
  };
  return actions;
}

function isLoading(state) {
  return state.status === 'loading';
}
function isSuccess(state) {
  return state.status === 'success';
}
function isFail(state) {
  return state.status === 'fail';
}

function selectFilter(state) {
  return state.filters;
}
function createFilterTraitSelectors() {
  return {
    selectFilter,
  };
}

function createLoadEntitiesTraitSelectors(allConfigs) {
  var _a, _b;
  const adapter =
    (_a =
      allConfigs === null || allConfigs === void 0
        ? void 0
        : allConfigs.loadEntities) === null || _a === void 0
      ? void 0
      : _a.adapter;
  const entitySelectors =
    adapter === null || adapter === void 0 ? void 0 : adapter.getSelectors();
  const filterFunction =
    (_b =
      allConfigs === null || allConfigs === void 0
        ? void 0
        : allConfigs.filter) === null || _b === void 0
      ? void 0
      : _b.filterFn;
  let selectors = entitySelectors;
  if (filterFunction && entitySelectors) {
    const selectAll = createSelector(
      entitySelectors.selectAll,
      selectFilter,
      (entities, filters) =>
        filters ? entities.filter((e) => filterFunction(filters, e)) : entities
    );
    selectors = {
      selectAll,
      selectEntities: createSelector(
        entitySelectors.selectEntities,
        selectFilter,
        (entities, filters) => {
          const result = {};
          for (const id in entities) {
            const e = entities[id];
            if (filterFunction(filters, e)) {
              result[id] = e;
            }
          }
          return result;
        }
      ),
      selectTotal: createSelector(selectAll, (entities) => entities.length),
      selectIds: createSelector(selectAll, (entities) =>
        entities.map((e) =>
          adapter === null || adapter === void 0 ? void 0 : adapter.selectId(e)
        )
      ),
    };
  }
  return Object.assign(Object.assign({}, selectors), {
    isFail,
    isLoading,
    isSuccess,
  });
}

function addLoadEntities(traitConfig) {
  const adapter = createEntityAdapter(traitConfig);
  return createTraitFactory({
    key: loadEntitiesTraitKey,
    config: Object.assign(Object.assign({}, traitConfig), { adapter }),
    actions: ({ actionsGroupKey }) =>
      createLoadEntitiesTraitActions(actionsGroupKey),
    selectors: ({ allConfigs }) => createLoadEntitiesTraitSelectors(allConfigs),
    mutators: ({ allConfigs }) => createLoadEntitiesTraitMutators(allConfigs),
    initialState: ({ previousInitialState, allConfigs }) =>
      createLoadEntitiesInitialState(previousInitialState, allConfigs),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createLoadEntitiesTraitReducer(
        initialState,
        allActions,
        allMutators,
        allConfigs
      ),
  });
}

const paginationTraitKey = 'pagination';

function createFilterTraitEffects(allActions, allSelectors, allConfigs) {
  const traitConfig = allConfigs.filter;
  class FilterEffect extends TraitEffect {
    constructor() {
      super(...arguments);
      this.storeFilter$ = createEffect(
        () =>
          ({
            debounce: debounceTime = traitConfig.defaultDebounceTime,
            scheduler = asyncScheduler,
          } = {}) =>
            this.actions$.pipe(
              ofType(allActions.filter),
              debounce((value) =>
                (value === null || value === void 0 ? void 0 : value.forceLoad)
                  ? EMPTY
                  : timer(debounceTime, scheduler)
              ),
              concatMap((payload) =>
                payload.patch
                  ? this.store.select(allSelectors.selectFilter).pipe(
                      first(),
                      map((storedFilters) =>
                        Object.assign(Object.assign({}, payload), {
                          filters: Object.assign(
                            Object.assign({}, storedFilters),
                            payload === null || payload === void 0
                              ? void 0
                              : payload.filters
                          ),
                        })
                      )
                    )
                  : of(payload)
              ),
              distinctUntilChanged(
                (previous, current) =>
                  !(current === null || current === void 0
                    ? void 0
                    : current.forceLoad) &&
                  JSON.stringify(
                    previous === null || previous === void 0
                      ? void 0
                      : previous.filters
                  ) ===
                    JSON.stringify(
                      current === null || current === void 0
                        ? void 0
                        : current.filters
                    )
              ),
              map((action) =>
                allActions.storeFilter({
                  filters:
                    action === null || action === void 0
                      ? void 0
                      : action.filters,
                  patch:
                    action === null || action === void 0
                      ? void 0
                      : action.patch,
                })
              )
            )
      );
      this.fetch$ =
        !(traitConfig === null || traitConfig === void 0
          ? void 0
          : traitConfig.filterFn) &&
        createEffect(() => {
          return this.actions$.pipe(
            ofType(allActions['storeFilter']),
            concatMap(() =>
              (
                allActions === null || allActions === void 0
                  ? void 0
                  : allActions.loadFirstPage
              )
                ? [allActions.clearPagesCache(), allActions.loadFirstPage()]
                : [allActions.fetch()]
            )
          );
        });
    }
  }
  FilterEffect.decorators = [{ type: Injectable }];
  return [FilterEffect];
}

function createFilterInitialState(previousInitialState, allConfigs) {
  var _a;
  return Object.assign(Object.assign({}, previousInitialState), {
    filters:
      (_a =
        allConfigs === null || allConfigs === void 0
          ? void 0
          : allConfigs.filter) === null || _a === void 0
        ? void 0
        : _a.defaultFilter,
  });
}
function createFilterTraitReducer(initialState, allActions, allMutators) {
  return createReducer(
    initialState,
    on(allActions.storeFilter, (state, { filters }) =>
      allMutators.setFilters(filters, state)
    )
  );
}

const filterTraitKey = 'filter';

function createFilterTraitMutators() {
  function setFilters(filters, state) {
    return Object.assign(Object.assign({}, state), { filters });
  }
  return { setFilters };
}

function createFilterTraitActions(actionsGroupKey) {
  const actions = {
    filter: createAction(`${actionsGroupKey} filter`, (props) => ({
      filters: props === null || props === void 0 ? void 0 : props.filters,
      forceLoad: props === null || props === void 0 ? void 0 : props.forceLoad,
      patch: props === null || props === void 0 ? void 0 : props.patch,
    })),
    storeFilter: createAction(`${actionsGroupKey} store filter`, (props) => ({
      filters: props === null || props === void 0 ? void 0 : props.filters,
      patch: props === null || props === void 0 ? void 0 : props.patch,
    })),
  };
  return actions;
}

function addFilter({
  defaultDebounceTime = 400,
  defaultFilter,
  filterFn,
} = {}) {
  return createTraitFactory({
    key: filterTraitKey,
    depends: [paginationTraitKey, loadEntitiesTraitKey],
    config: { defaultDebounceTime, defaultFilter, filterFn },
    actions: ({ actionsGroupKey }) => createFilterTraitActions(actionsGroupKey),
    selectors: () => createFilterTraitSelectors(),
    mutators: () => createFilterTraitMutators(),
    initialState: ({ previousInitialState, allConfigs }) =>
      createFilterInitialState(previousInitialState, allConfigs),
    reducer: ({ initialState, allActions, allMutators }) =>
      createFilterTraitReducer(initialState, allActions, allMutators),
    effects: ({ allActions, allSelectors, allConfigs }) =>
      createFilterTraitEffects(allActions, allSelectors, allConfigs),
  });
}

function createPaginationTraitSelectors(previousSelectors, allConfigs) {
  var _a;
  const { selectAll, isLoading } = previousSelectors;
  const filterFunction =
    (_a =
      allConfigs === null || allConfigs === void 0
        ? void 0
        : allConfigs.filter) === null || _a === void 0
      ? void 0
      : _a.filterFn;
  function selectPagination(state) {
    return state.pagination;
  }
  const selectPaginationFiltered = filterFunction
    ? createSelector(selectAll, selectPagination, (entities, pagination) => {
        return Object.assign(Object.assign({}, pagination), {
          total: entities.length,
          cache: Object.assign(Object.assign({}, pagination.cache), {
            start: 0,
            end: entities.length,
          }),
        });
      })
    : selectPagination;
  const selectPageEntities = createSelector(
    selectAll,
    selectPaginationFiltered,
    (entities, pagination, { page } = { page: pagination.currentPage }) => {
      const startIndex = page * pagination.pageSize - pagination.cache.start;
      let endIndex = startIndex + pagination.pageSize;
      endIndex =
        endIndex < pagination.cache.end ? endIndex : pagination.cache.end;
      return entities.slice(startIndex, endIndex);
    }
  );
  const selectPageInfo = createSelector(
    selectPaginationFiltered,
    (pagination) => {
      const pagesCount =
        pagination.total && pagination.total > 0
          ? Math.ceil(pagination.total / pagination.pageSize)
          : undefined;
      return {
        pageIndex: pagination.currentPage,
        total: pagination.total,
        pageSize: pagination.pageSize,
        pagesCount,
        hasPrevious: pagination.currentPage - 1 >= 0,
        hasNext:
          pagination.total && pagination.total > 0
            ? pagination.currentPage + 1 < pagesCount
            : true,
        cacheType: pagination.cache.type,
      };
    }
  );
  const isPageInCache = createSelector(
    selectPaginationFiltered,
    (pagination, { page } = { page: pagination.currentPage }) => {
      const startIndex = page * pagination.pageSize;
      let endIndex = startIndex + pagination.pageSize - 1;
      endIndex =
        pagination.total && endIndex > pagination.total
          ? pagination.total - 1
          : endIndex;
      return (
        startIndex >= pagination.cache.start && endIndex <= pagination.cache.end
      );
    }
  );
  const selectPage = createSelector(
    selectPageEntities,
    selectPageInfo,
    // props look unsued but they are pass to the selectPageEntities
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (entities, pageInfo, props = { page: pageInfo.pageIndex }) =>
      Object.assign({ entities }, pageInfo)
  );
  const selectPagedRequest = createSelector(selectPagination, (pagination) => ({
    startIndex: pagination.pageSize * pagination.requestPage,
    size: pagination.pageSize * pagination.pagesToCache,
    page: pagination.requestPage,
  }));
  const isLoadingPage = createSelector(
    isLoading,
    selectPagination,
    (isLoading, pagination) =>
      isLoading && pagination.requestPage === pagination.currentPage
  );
  return {
    selectPageEntities,
    isPageInCache,
    selectPage,
    selectPagedRequest,
    selectPageInfo,
    isLoadingPage,
  };
}

function createPaginationTraitActions(actionsGroupKey) {
  const actions = {
    loadPage: createAction(
      `${actionsGroupKey} load page`,
      ({ index, forceLoad }) => ({
        index,
        forceLoad,
      })
    ),
    loadPageSuccess: createAction(`${actionsGroupKey} load
          page success`),
    loadPageFail: createAction(`${actionsGroupKey} load page fail`),
    loadPreviousPage: createAction(`${actionsGroupKey} load previous page`),
    loadNextPage: createAction(`${actionsGroupKey} load next page`),
    loadFirstPage: createAction(
      `${actionsGroupKey} load first page`,
      (forceLoad) => ({ forceLoad })
    ),
    loadLastPage: createAction(`${actionsGroupKey} load last page`),
    clearPagesCache: createAction(`${actionsGroupKey} clear cache`),
    setRequestPage: createAction(
      `${actionsGroupKey} set request page`,
      props()
    ),
  };
  return actions;
}

function createPaginationInitialState(previousInitialState, allConfigs) {
  const { currentPage, pageSize, cacheType, pagesToCache } =
    allConfigs.pagination;
  return Object.assign(Object.assign({}, previousInitialState), {
    pagination: {
      pageSize,
      currentPage,
      requestPage: currentPage,
      pagesToCache,
      cache: {
        type: cacheType,
        start: 0,
        end: 0,
      },
    },
  });
}
function createPaginationTraitReducer(
  initialState,
  allActions,
  allSelectors,
  allMutators,
  allConfigs
) {
  var _a;
  function addToCacheTotal(state, add) {
    var _a;
    return Object.assign(Object.assign({}, state), {
      pagination: Object.assign(Object.assign({}, state.pagination), {
        total:
          ((_a = state.pagination.total) !== null && _a !== void 0 ? _a : 0) +
          add,
      }),
    });
  }
  function clearPagesCache(state) {
    return Object.assign(Object.assign({}, state), {
      entities: {},
      ids: [],
      pagination: Object.assign(Object.assign({}, state.pagination), {
        currentPage: 0,
        total: 0,
        cache: Object.assign(Object.assign({}, state.pagination.cache), {
          start: 0,
          end: 0,
        }),
      }),
    });
  }
  function recalculateTotal(state) {
    const total = allSelectors.selectTotal(state);
    return Object.assign(Object.assign({}, state), {
      status: 'success',
      pagination: Object.assign(Object.assign({}, state.pagination), {
        currentPage: 0,
        total,
        cache: Object.assign(Object.assign({}, state.pagination.cache), {
          start: 0,
          end: total,
        }),
      }),
    });
  }
  const filterRemote = !((_a =
    allConfigs === null || allConfigs === void 0
      ? void 0
      : allConfigs.filter) === null || _a === void 0
    ? void 0
    : _a.filterFn);
  return createReducer(
    initialState,
    on(allActions.loadPage, (state, { index }) =>
      Object.assign(Object.assign({}, state), {
        pagination: Object.assign(Object.assign({}, state.pagination), {
          currentPage: index,
          requestPage: index,
        }),
        status: 'loading',
      })
    ),
    on(allActions.setRequestPage, (state, { index }) =>
      Object.assign(Object.assign({}, state), {
        pagination: Object.assign(Object.assign({}, state.pagination), {
          requestPage: index,
        }),
        status: 'loading',
      })
    ),
    on(allActions.loadPageSuccess, (state) =>
      Object.assign(Object.assign({}, state), { status: 'success' })
    ),
    on(allActions.loadPageFail, (state) =>
      Object.assign(Object.assign({}, state), { status: 'fail' })
    ),
    on(allActions.clearPagesCache, (state) => clearPagesCache(state)),
    on(allActions.fetchSuccess, (state, { entities, total }) =>
      allMutators.mergePaginatedEntities(
        entities,
        total,
        Object.assign(Object.assign({}, state), { status: 'success' })
      )
    ),
    ...insertIf(allActions.add, () =>
      on(allActions.add, (state, { entities }) =>
        addToCacheTotal(state, entities.length)
      )
    ),
    ...insertIf(allActions.remove, () =>
      on(allActions.remove, (state, { keys }) =>
        addToCacheTotal(state, -keys.length)
      )
    ),
    ...insertIf(filterRemote && allActions.filter, () =>
      on(allActions.filter, (state) => recalculateTotal(state))
    ),
    ...insertIf(allActions.removeAll, () =>
      on(allActions.removeAll, (state) => clearPagesCache(state))
    )
  );
}

function createPaginationTraitEffects(allActions, allSelectors) {
  class PaginationEffect extends TraitEffect {
    constructor() {
      super(...arguments);
      this.loadPage$ = createEffect(() => {
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
      this.preloadNextPage$ = createEffect(() => {
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
            allActions.setRequestPage({ index: pageInfo.pageIndex + 1 }),
            allActions.fetch(),
          ])
        );
      });
      this.loadFirstPage$ = createEffect(() => {
        return this.actions$.pipe(
          ofType(allActions.loadFirstPage),
          map(() => allActions.loadPage({ index: 0 }))
        );
      });
      this.loadPreviousPage$ = createEffect(() => {
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
      this.loadNextPage$ = createEffect(() => {
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
      this.loadLastPage$ = createEffect(() => {
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
  }
  PaginationEffect.decorators = [{ type: Injectable }];
  return [PaginationEffect];
}

function createPaginationTraitMutators(allSelectors, allConfigs) {
  const adapter = allConfigs.loadEntities.adapter;
  function mergePaginatedEntities(entities, total = undefined, state) {
    const cacheType = state.pagination.cache.type;
    switch (cacheType) {
      case 'full':
        return adapter.setAll(
          entities,
          Object.assign(Object.assign({}, state), {
            pagination: Object.assign(Object.assign({}, state.pagination), {
              total: entities.length,
              cache: Object.assign(Object.assign({}, state.pagination.cache), {
                start: 0,
                end: entities.length,
              }),
            }),
          })
        );
      case 'partial': {
        const isPreloadNextPages =
          state.pagination.currentPage + 1 === state.pagination.requestPage;
        const start = state.pagination.currentPage * state.pagination.pageSize;
        const newEntities = isPreloadNextPages
          ? [...allSelectors.selectPageEntities(state), ...entities]
          : entities;
        return adapter.setAll(
          newEntities,
          Object.assign(Object.assign({}, state), {
            pagination: Object.assign(Object.assign({}, state.pagination), {
              total,
              cache: Object.assign(Object.assign({}, state.pagination.cache), {
                start,
                end: start + entities.length,
              }),
            }),
          })
        );
      }
      case 'grow':
        return adapter.addMany(
          entities,
          Object.assign(Object.assign({}, state), {
            pagination: Object.assign(Object.assign({}, state.pagination), {
              total,
              cache: Object.assign(Object.assign({}, state.pagination.cache), {
                end: state.ids.length + entities.length,
              }),
            }),
          })
        );
    }
    return state;
  }
  return { mergePaginatedEntities };
}

function addPagination({
  cacheType = 'full',
  pageSize = 20,
  currentPage = 0,
  pagesToCache = 3,
} = {}) {
  return createTraitFactory({
    key: paginationTraitKey,
    depends: [loadEntitiesTraitKey],
    config: {
      cacheType,
      pageSize,
      currentPage,
      pagesToCache,
    },
    actions: ({ actionsGroupKey }) =>
      createPaginationTraitActions(actionsGroupKey),
    selectors: ({ previousSelectors, allConfigs }) =>
      createPaginationTraitSelectors(previousSelectors, allConfigs),
    mutators: ({ allSelectors, allConfigs }) =>
      createPaginationTraitMutators(allSelectors, allConfigs),
    initialState: ({ previousInitialState, allConfigs }) =>
      createPaginationInitialState(previousInitialState, allConfigs),
    reducer: ({
      initialState,
      allActions,
      allSelectors,
      allMutators,
      allConfigs,
    }) =>
      createPaginationTraitReducer(
        initialState,
        allActions,
        allSelectors,
        allMutators,
        allConfigs
      ),
    effects: ({ allActions, allSelectors }) =>
      createPaginationTraitEffects(allActions, allSelectors),
  });
}

function createMultiSelectionTraitActions(actionsGroupKey) {
  return {
    multiSelect: createAction(`${actionsGroupKey} Select`, props()),
    multiDeselect: createAction(`${actionsGroupKey} Deselect`, props()),
    multiToggleSelect: createAction(
      `${actionsGroupKey} Toggle Select`,
      props()
    ),
    toggleSelectAll: createAction(`${actionsGroupKey} Toggle Select All`),
    multiClearSelection: createAction(`${actionsGroupKey} Clear Selection`),
  };
}

function multiDeselect(id, state) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _a = state.selectedIds,
    _b = id,
    _value = _a[_b],
    selectedIds = __rest(_a, [typeof _b === 'symbol' ? _b : _b + '']);
  return Object.assign(Object.assign({}, state), { selectedIds: selectedIds });
}
function multiSelect(id, state) {
  return Object.assign(Object.assign({}, state), {
    selectedIds: Object.assign(Object.assign({}, state.selectedIds), {
      [id]: true,
    }),
  });
}
function multiToggleSelect(id, state) {
  const selected = state.selectedIds[id];
  if (selected) {
    return multiDeselect(id, state);
  } else {
    return multiSelect(id, state);
  }
}
function multiClearSelection(state) {
  return Object.assign(Object.assign({}, state), { selectedIds: {} });
}
function selectTotalSelected(state) {
  return Object.keys(state.selectedIds).length;
}

function createMultiSelectionTraitSelectors(previousSelectors) {
  const { selectEntities, selectTotal } = previousSelectors;
  function selectIdsSelected(state) {
    return state.selectedIds;
  }
  const selectAllIdsSelected = createSelector(selectIdsSelected, (ids) =>
    Object.keys(ids)
  );
  const selectEntitiesSelected = createSelector(
    selectAllIdsSelected,
    selectEntities,
    (selectedIds, entities) =>
      selectedIds.reduce((acum, id) => {
        acum[id] = entities[id];
        return acum;
      }, {})
  );
  const selectAllSelected = createSelector(
    selectAllIdsSelected,
    selectEntities,
    (selectedIds, entities) => selectedIds.map((id) => entities[id])
  );
  const isAllSelected = createSelector(
    (state) => selectTotal(state),
    selectTotalSelected,
    (total, totalSelected) =>
      totalSelected === total ? 'all' : totalSelected === 0 ? 'none' : 'some'
  );
  return {
    selectIdsSelected,
    selectAllIdsSelected,
    selectEntitiesSelected,
    selectAllSelected,
    selectTotalSelected,
    isAllSelected,
  };
}

function createMultiSelectionInitialState(previousInitialState) {
  return Object.assign(Object.assign({}, previousInitialState), {
    selectedIds: {},
  });
}
function createMultiSelectionTraitReducer(
  initialState,
  allActions,
  allMutators,
  allConfigs
) {
  var _a, _b;
  const { adapter } = allConfigs.loadEntities;
  const sortRemote =
    (_a = allConfigs.sort) === null || _a === void 0 ? void 0 : _a.remote;
  const paginationCacheType =
    (_b = allConfigs.pagination) === null || _b === void 0
      ? void 0
      : _b.cacheType;
  function updateSelectedIdsChanged(state, updates) {
    const changedIds = updates.reduce((acc, updated) => {
      const id = adapter.selectId(updated.changes);
      if (id && id !== updated.id && state.selectedIds[updated.id] != null) {
        acc.push(updated);
        return acc;
      }
      return acc;
    }, []);
    if (changedIds.length) {
      const selectedIds = Object.assign({}, state.selectedIds);
      changedIds.forEach((updated) => {
        const id = adapter.selectId(updated.changes);
        const value = selectedIds[updated.id];
        delete selectedIds[updated.id];
        selectedIds[id] = value;
      });
      return Object.assign(Object.assign({}, state), { selectedIds });
    }
    return state;
  }
  return createReducer(
    initialState,
    on(allActions.multiSelect, (state, { id }) =>
      allMutators.multiSelect(id, state)
    ),
    on(allActions.multiDeselect, (state, { id }) =>
      allMutators.multiDeselect(id, state)
    ),
    on(allActions.multiToggleSelect, (state, { id }) =>
      allMutators.multiToggleSelect(id, state)
    ),
    on(allActions.toggleSelectAll, (state) =>
      allMutators.toggleSelectAll(state)
    ),
    ...insertIf(allActions.remove, () =>
      on(allActions.remove, (state, { keys }) => {
        const selectedIds = Object.assign({}, state.selectedIds);
        keys.forEach((v) => {
          delete selectedIds[v];
        });
        return Object.assign(Object.assign({}, state), { selectedIds });
      })
    ),
    ...insertIf(allActions.update, () =>
      on(allActions.update, (state, { updates }) =>
        updateSelectedIdsChanged(state, updates)
      )
    ),
    on(allActions.multiClearSelection, (state) =>
      allMutators.multiClearSelection(state)
    ),
    ...insertIf(allActions.removeAll, () =>
      on(allActions.removeAll, (state) =>
        allMutators.multiClearSelection(state)
      )
    ),
    ...insertIf(sortRemote, () =>
      on(allActions.sort, (state) => allMutators.multiClearSelection(state))
    ),
    ...insertIf(allActions.filter, () =>
      on(allActions.filter, (state) => allMutators.multiClearSelection(state))
    ),
    ...insertIf(!allActions.loadPageSuccess, () =>
      on(allActions.fetchSuccess, (state) =>
        allMutators.multiClearSelection(state)
      )
    ),
    ...insertIf(
      allActions.loadPageSuccess && paginationCacheType === 'partial',
      () =>
        on(allActions.loadPageSuccess, (state) =>
          allMutators.multiClearSelection(state)
        )
    )
  );
}

function createMultiSelectionTraitMutators({ isAllSelected }) {
  function toggleSelectAll(state) {
    const allSelected = isAllSelected(state);
    if (allSelected === 'all') {
      return Object.assign(Object.assign({}, state), { selectedIds: {} });
    } else {
      return Object.assign(Object.assign({}, state), {
        selectedIds: toMap(state.ids),
      });
    }
  }
  return {
    multiDeselect,
    multiSelect,
    multiToggleSelect,
    toggleSelectAll,
    multiClearSelection,
  };
}

function addMultiSelection() {
  return createTraitFactory({
    key: 'multiSelection',
    depends: [loadEntitiesTraitKey],
    actions: ({ actionsGroupKey }) =>
      createMultiSelectionTraitActions(actionsGroupKey),
    selectors: ({ previousSelectors }) =>
      createMultiSelectionTraitSelectors(previousSelectors),
    initialState: ({ previousInitialState }) =>
      createMultiSelectionInitialState(previousInitialState),
    mutators: ({ allSelectors }) =>
      createMultiSelectionTraitMutators(allSelectors),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createMultiSelectionTraitReducer(
        initialState,
        allActions,
        allMutators,
        allConfigs
      ),
  });
}

function createSingleSelectionTraitActions(actionsGroupKey) {
  return {
    select: createAction(`${actionsGroupKey} Select`, props()),
    deselect: createAction(`${actionsGroupKey} Deselect`),
    toggleSelect: createAction(`${actionsGroupKey} Toggle Select`, props()),
  };
}

function createSingleSelectionTraitSelectors() {
  function selectIdSelected(state) {
    return state.selectedId;
  }
  function selectEntitySelected(state) {
    return (state.selectedId && state.entities[state.selectedId]) || undefined;
  }
  return {
    selectIdSelected,
    selectEntitySelected,
  };
}

function createSingleSelectionInitialState(previousInitialState, allConfigs) {
  var _a;
  const selectedId =
    (_a = allConfigs.singleSelection) === null || _a === void 0
      ? void 0
      : _a.selectedId;
  return Object.assign(Object.assign({}, previousInitialState), { selectedId });
}
function createSingleSelectionTraitReducer(
  initialState,
  allActions,
  allMutators,
  allConfigs
) {
  var _a, _b;
  const { adapter } = allConfigs.loadEntities;
  const sortRemote =
    (_a = allConfigs.sort) === null || _a === void 0 ? void 0 : _a.remote;
  const paginationCacheType =
    (_b = allConfigs.pagination) === null || _b === void 0
      ? void 0
      : _b.cacheType;
  return createReducer(
    initialState,
    on(allActions.select, (state, { id }) => allMutators.select(id, state)),
    on(allActions.deselect, (state) => allMutators.deselect(state)),
    on(allActions.toggleSelect, (state, { id }) =>
      allMutators.toggleSelect(id, state)
    ),
    ...insertIf(allActions.removeAll, () =>
      on(allActions.removeAll, (state) => allMutators.deselect(state))
    ),
    ...insertIf(sortRemote, () =>
      on(allActions.sort, (state) => allMutators.deselect(state))
    ),
    ...insertIf(allActions.filter, () =>
      on(allActions.filter, (state) => allMutators.deselect(state))
    ),
    ...insertIf(!allActions.loadPageSuccess, () =>
      on(allActions.fetchSuccess, (state) => allMutators.deselect(state))
    ),
    ...insertIf(
      allActions.loadPageSuccess && paginationCacheType === 'partial',
      () =>
        on(allActions.loadPageSuccess, (state) => allMutators.deselect(state))
    ),
    ...insertIf(allActions.remove, () =>
      on(allActions.remove, (state, { keys }) => {
        const shouldDeselect = keys.some((v) => v === state.selectedId);
        return shouldDeselect
          ? Object.assign(Object.assign({}, state), { selectedId: undefined })
          : state;
      })
    ),
    ...insertIf(allActions.update, () =>
      on(allActions.update, (state, { updates }) => {
        const change = updates.find((updated) => {
          const id = adapter.selectId(updated.changes);
          return id && id !== updated.id && state.selectedId === updated.id;
        });
        return change
          ? Object.assign(Object.assign({}, state), {
              selectedId: adapter.selectId(change.changes),
            })
          : state;
      })
    )
  );
}

function createSingleSelectionTraitMutators() {
  function select(id, state) {
    return Object.assign(Object.assign({}, state), { selectedId: id });
  }
  function deselect(state) {
    return Object.assign(Object.assign({}, state), { selectedId: undefined });
  }
  function toggleSelect(id, state) {
    return Object.assign(Object.assign({}, state), {
      selectedId: state.selectedId === id ? undefined : id,
    });
  }
  return {
    select,
    deselect,
    toggleSelect,
  };
}

function addSingleSelection(config) {
  return createTraitFactory({
    key: 'singleSelection',
    depends: [loadEntitiesTraitKey],
    config,
    actions: ({ actionsGroupKey }) =>
      createSingleSelectionTraitActions(actionsGroupKey),
    selectors: () => createSingleSelectionTraitSelectors(),
    mutators: () => createSingleSelectionTraitMutators(),
    initialState: ({ previousInitialState, allConfigs }) =>
      createSingleSelectionInitialState(previousInitialState, allConfigs),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createSingleSelectionTraitReducer(
        initialState,
        allActions,
        allMutators,
        allConfigs
      ),
  });
}

const singleSelectionTraitKey = 'singleSelection';

var ChangeType;
(function (ChangeType) {
  ChangeType['CREATED'] = 'c';
  ChangeType['UPDATED'] = 'u';
  ChangeType['DELETED'] = 'd';
})(ChangeType || (ChangeType = {}));
const crudTraitKey = 'crud';

function createCrudTraitActions(actionsGroupKey) {
  return {
    add: createAction(`${actionsGroupKey} Add`, (...entities) => ({
      entities,
    })),
    remove: createAction(`${actionsGroupKey} Remove`, (...keys) => ({
      keys,
    })),
    update: createAction(`${actionsGroupKey} Update`, (...updates) => ({
      updates,
    })),
    upsert: createAction(`${actionsGroupKey} Upsert`, (...entities) => ({
      entities,
    })),
    removeAll: createAction(`${actionsGroupKey} Remove All`, (predicate) => ({
      predicate,
    })),
    clearChanges: createAction(`${actionsGroupKey} Clear Changes`),
  };
}

function createCrudTraitSelectors(previousSelectors) {
  function selectChanges(state) {
    return state.changes;
  }
  function selectFilteredChanges(state) {
    const cache = {};
    return state.changes.reduce((acc, value) => {
      const changes = cache[value.id];
      if (!changes) {
        cache[value.id] = [value.changeType];
        acc.push(value);
        return acc;
      }
      if (value.changeType === ChangeType.UPDATED) {
        return acc;
      }
      if (
        value.changeType === ChangeType.DELETED &&
        changes.includes(ChangeType.CREATED)
      ) {
        delete cache[value.id];
        return acc.filter((v) => v.id !== value.id);
      }
      if (value.changeType === ChangeType.DELETED) {
        delete cache[value.id];
        const newAcc = acc.filter((v) => v.id !== value.id);
        newAcc.push(value);
        return newAcc;
      }
      return acc;
    }, []);
  }
  const { selectEntities } = previousSelectors;
  const selectAllChanges = createSelector(
    (state) => selectEntities(state),
    selectChanges,
    (entities, changed, { type }) => {
      if (type)
        return changed
          .filter((c) => c.changeType === type)
          .map((change) => {
            var _a;
            return {
              changeType: change.changeType,
              entity:
                (_a = entities[change.id]) !== null && _a !== void 0
                  ? _a
                  : {
                      id: change.id,
                    },
            };
          });
      const map = changed.map((change) => {
        var _a;
        return {
          changeType: change.changeType,
          entity:
            (_a = entities[change.id]) !== null && _a !== void 0
              ? _a
              : {
                  id: change.id,
                },
        };
      });
      return map;
    }
  );
  const selectAllFilteredChanges = createSelector(
    selectFilteredChanges,
    (state) => selectEntities(state),
    (changes, entities) =>
      changes.map((c) => {
        var _a;
        return {
          entity:
            (_a = entities[c.id]) !== null && _a !== void 0 ? _a : { id: c.id },
          changeType: c.changeType,
        };
      })
  );
  return {
    selectAllChanges,
    selectAllFilteredChanges,
    selectChanges,
    selectFilteredChanges,
  };
}

function createCrudInitialState(previousInitialState) {
  return Object.assign(Object.assign({}, previousInitialState), {
    changes: [],
  });
}
function createCrudTraitReducer(
  initialState,
  allActions,
  allMutators,
  allConfigs
) {
  var _a, _b, _c;
  const sortRemote =
    (_a = allConfigs.sort) === null || _a === void 0 ? void 0 : _a.remote;
  const filterRemote =
    allConfigs.filter &&
    !((_b = allConfigs.filter) === null || _b === void 0
      ? void 0
      : _b.filterFn);
  const paginationCacheType =
    (_c = allConfigs.pagination) === null || _c === void 0
      ? void 0
      : _c.cacheType;
  return createReducer(
    initialState,
    on(allActions.add, (state, { entities }) =>
      allMutators.add(entities, state)
    ),
    on(allActions.update, (state, { updates }) =>
      allMutators.update(updates, state)
    ),
    on(allActions.upsert, (state, { entities }) =>
      allMutators.upsert(entities, state)
    ),
    on(allActions.remove, (state, { keys }) => allMutators.remove(keys, state)),
    on(allActions.removeAll, (state, { predicate }) =>
      predicate
        ? allMutators.remove(predicate, state)
        : allMutators.removeAll(state)
    ),
    on(allActions.clearChanges, (state) => allMutators.clearChanges(state)),
    ...insertIf(sortRemote, () =>
      on(allActions.sort, (state) => allMutators.clearChanges(state))
    ),
    ...insertIf(filterRemote, () =>
      on(allActions.filter, (state) => allMutators.clearChanges(state))
    ),
    ...insertIf(!allActions.loadPageSuccess, () =>
      on(allActions.fetchSuccess, (state) => allMutators.clearChanges(state))
    ),
    ...insertIf(
      allActions.loadPageSuccess && paginationCacheType === 'partial',
      () =>
        on(allActions.loadPageSuccess, (state) =>
          allMutators.clearChanges(state)
        )
    )
  );
}

function createCrudTraitMutators(allConfigs) {
  const { storeChanges } = allConfigs.crud || {};
  const adapter = allConfigs.loadEntities.adapter;
  function generateChangeEntry(entity, changeType, customId) {
    return {
      id:
        customId !== null && customId !== void 0
          ? customId
          : adapter.selectId(entity),
      changeType,
      entityChanges: (storeChanges && entity) || undefined,
    };
  }
  function add(entities, state, addFirst = false) {
    const changes = [
      ...state.changes,
      ...entities.map((entity) =>
        generateChangeEntry(entity, ChangeType.CREATED)
      ),
    ];
    if (!addFirst)
      return adapter.addMany(
        entities,
        Object.assign(Object.assign({}, state), { changes })
      );
    const newIds = entities.map((e) => adapter.selectId(e));
    const newEntities = Object.assign({}, state.entities);
    entities.forEach((e) => {
      const id = adapter.selectId(e);
      newEntities[id] = e;
    });
    return Object.assign(Object.assign({}, state), {
      ids: [...newIds, ...state.ids],
      entities: newEntities,
      changes,
    });
  }
  function upsert(entities, state) {
    const oldChanges = [...state.changes];
    const existingIds = adapter.getSelectors().selectIds(state);
    const [additions, updates] = entities.reduce(
      ([a, u], entity) =>
        existingIds.indexOf(adapter.selectId(entity)) !== -1
          ? [a, [...u, entity]]
          : [[...a, entity], u],
      [new Array(), new Array()]
    );
    return adapter.upsertMany(
      entities,
      Object.assign(Object.assign({}, state), {
        changes: [
          ...oldChanges,
          ...additions.map((entity) =>
            generateChangeEntry(entity, ChangeType.CREATED)
          ),
          ...updates.map((entity) =>
            generateChangeEntry(entity, ChangeType.UPDATED)
          ),
        ],
      })
    );
  }
  function remove(keysOrPredicate, state) {
    if (typeof keysOrPredicate === 'function') {
      return adapter.removeMany(
        keysOrPredicate,
        Object.assign(Object.assign({}, state), {
          changes: [
            ...state.changes,
            ...state.ids.map((id) => ({
              id,
              changeType: ChangeType.DELETED,
            })),
          ],
        })
      );
    }
    return adapter.removeMany(
      keysOrPredicate,
      Object.assign(Object.assign({}, state), {
        changes: [
          ...state.changes,
          ...keysOrPredicate.map((key) => ({
            id: key,
            changeType: ChangeType.DELETED,
          })),
        ],
      })
    );
  }
  function removeAll(state) {
    return adapter.removeAll(
      Object.assign(Object.assign({}, state), {
        changes: [
          ...state.changes,
          ...state.ids.map((id) => ({
            id,
            changeType: ChangeType.DELETED,
          })),
        ],
      })
    );
  }
  function clearChanges(state) {
    return Object.assign(Object.assign({}, state), { changes: [] });
  }
  function update(updates, state) {
    const oldChanges = [...state.changes];
    updates.forEach((updated) => {
      const id = adapter.selectId(updated.changes);
      if (id && id !== updated.id) {
        // if the id changes update the id of pold changes
        const index = oldChanges.findIndex((v) => v.id === updated.id);
        const oldChange = oldChanges[index];
        oldChanges[index] = Object.assign(Object.assign({}, oldChange), { id });
      }
    });
    return adapter.updateMany(
      updates,
      Object.assign(Object.assign({}, state), {
        changes: [
          ...oldChanges,
          ...updates.map((updated) => {
            var _a;
            return {
              id:
                (_a = adapter.selectId(updated.changes)) !== null &&
                _a !== void 0
                  ? _a
                  : updated.id,
              changeType: ChangeType.UPDATED,
              entityChanges: (storeChanges && updated.changes) || undefined,
            };
          }),
        ],
      })
    );
  }
  return {
    add,
    remove,
    update,
    removeAll,
    clearChanges,
    upsert,
  };
}

function addCrudEntities({ storeChanges = false } = {}) {
  return createTraitFactory({
    key: crudTraitKey,
    depends: [loadEntitiesTraitKey],
    config: { storeChanges },
    actions: ({ actionsGroupKey }) => createCrudTraitActions(actionsGroupKey),
    selectors: ({ previousSelectors }) =>
      createCrudTraitSelectors(previousSelectors),
    mutators: ({ allConfigs }) => createCrudTraitMutators(allConfigs),
    initialState: ({ previousInitialState }) =>
      createCrudInitialState(previousInitialState),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createCrudTraitReducer(initialState, allActions, allMutators, allConfigs),
  });
}

const sortTraitKey = 'sort';

const MAX_SAFE_INTEGER = 9007199254740991;
function sortingDataAccessor(data, sortHeaderId) {
  const value = data[sortHeaderId];
  if (_isNumberValue(value)) {
    const numberValue = Number(value);
    // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
    // leave them as strings. For more info: https://goo.gl/y5vbSg
    return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
  }
  return value;
}
/**
 * Gets a sorted copy of the data array based on the state of the Sort.
 * @param data The array of data that should be sorted.
 * @param sort The connected MatSort that holds the current sort state.
 */
function sortData(data, sort) {
  const active = sort.active;
  const direction = sort.direction;
  if (!active || direction === '') {
    return data;
  }
  return data.sort((a, b) => {
    const valueA = sortingDataAccessor(a, active);
    const valueB = sortingDataAccessor(b, active);
    // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
    // one value exists while the other doesn't. In this case, existing value should come last.
    // This avoids inconsistent results when comparing values to undefined/null.
    // If neither value exists, return 0 (equal).
    let comparatorResult = 0;
    if (valueA != null && valueB != null) {
      // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
      if (typeof valueA === 'string' || typeof valueB === 'string') {
        // if either values are a string, then force both to be strings before localCompare
        comparatorResult = valueA.toString().localeCompare(valueB.toString());
      } else {
        if (valueA > valueB) {
          comparatorResult = 1;
        } else if (valueA < valueB) {
          comparatorResult = -1;
        }
      }
    } else if (valueA != null) {
      comparatorResult = 1;
    } else if (valueB != null) {
      comparatorResult = -1;
    }
    return comparatorResult * (direction === 'asc' ? 1 : -1);
  });
}

function createSortTraitMutators({ selectAll }, allConfigs) {
  function sortEntities({ active, direction }, state) {
    const { adapter } = allConfigs.loadEntities;
    const entities = selectAll(state);
    const sortedIds = sortData(entities, { active, direction }).map((v) =>
      adapter.selectId(v)
    );
    return Object.assign(Object.assign({}, state), {
      ids: sortedIds,
      sort: Object.assign(Object.assign({}, state.sort), {
        current: { active, direction },
      }),
    });
  }
  return {
    sortEntities,
  };
}

function createSortInitialState(previousInitialState, allConfigs) {
  const { defaultSort } = allConfigs.sort;
  return Object.assign(Object.assign({}, previousInitialState), {
    sort: {
      current: defaultSort,
      default: defaultSort,
    },
  });
}
function createSortTraitReducer(
  initialState,
  allActions,
  allMutators,
  allConfigs
) {
  const { remote } = allConfigs.sort;
  return createReducer(
    initialState,
    on(allActions.sort, (state, { active, direction }) =>
      !remote
        ? allMutators.sortEntities({ active, direction }, state)
        : Object.assign(Object.assign({}, state), {
            sort: Object.assign(Object.assign({}, state.sort), {
              current: { active, direction },
            }),
          })
    ),
    on(allActions.resetSort, (state) => {
      var _a, _b, _c;
      return ((_a = state.sort) === null || _a === void 0 ? void 0 : _a.default)
        ? !remote
          ? allMutators.sortEntities(
              (_b = state.sort) === null || _b === void 0 ? void 0 : _b.default,
              state
            )
          : Object.assign(Object.assign({}, state), {
              sort: Object.assign(Object.assign({}, state.sort), {
                current:
                  (_c = state.sort) === null || _c === void 0
                    ? void 0
                    : _c.default,
              }),
            })
        : state;
    })
  );
}

function createSortTraitSelectors() {
  function selectSort(state) {
    var _a;
    return (_a = state.sort) === null || _a === void 0 ? void 0 : _a.current;
  }
  return {
    selectSort,
  };
}

function createSortTraitEffect(allActions, allConfigs) {
  const { remote } = allConfigs.sort;
  class SortEffect extends TraitEffect {
    constructor() {
      super(...arguments);
      this.remoteSort$ = createEffect(() => {
        return this.actions$.pipe(
          ofType(allActions.sort, allActions.resetSort),
          concatMap(() =>
            allActions.loadFirstPage
              ? [allActions.clearPagesCache(), allActions.loadFirstPage()]
              : [allActions.fetch()]
          )
        );
      });
    }
  }
  SortEffect.decorators = [{ type: Injectable }];
  return remote ? [SortEffect] : [];
}

function createSortTraitActions(actionsGroupKey) {
  return {
    sort: createAction(`${actionsGroupKey} sort`, props()),
    resetSort: createAction(`${actionsGroupKey} default sort`),
  };
}

function addSort({ remote = false, defaultSort } = {}) {
  return createTraitFactory({
    key: sortTraitKey,
    depends: [loadEntitiesTraitKey],
    config: { remote, defaultSort },
    actions: ({ actionsGroupKey }) => createSortTraitActions(actionsGroupKey),
    selectors: () => createSortTraitSelectors(),
    mutators: ({ allSelectors, allConfigs }) =>
      createSortTraitMutators(allSelectors, allConfigs),
    initialState: ({ previousInitialState, allConfigs }) =>
      createSortInitialState(previousInitialState, allConfigs),
    reducer: ({ initialState, allActions, allMutators, allConfigs }) =>
      createSortTraitReducer(initialState, allActions, allMutators, allConfigs),
    effects: ({ allActions, allConfigs }) =>
      createSortTraitEffect(allActions, allConfigs),
  });
}

function addReset(traitConfig = {}) {
  return createTraitFactory({
    key: 'reset',
    config: traitConfig,
    actions: ({ actionsGroupKey }) => ({
      reset: createAction(`${actionsGroupKey} Reset State`),
    }),
    reducer: ({ allActions, initialState }) =>
      createReducer(
        initialState,
        on(allActions.reset, () => initialState)
      ),
    effects: ({ allActions }) => {
      var _a;
      class ResetEffect extends TraitEffect {
        constructor() {
          var _a;
          super(...arguments);
          this.externalReset$ =
            ((_a =
              traitConfig === null || traitConfig === void 0
                ? void 0
                : traitConfig.resetOn) === null || _a === void 0
              ? void 0
              : _a.length) &&
            createEffect(() => {
              return this.actions$.pipe(
                ofType(
                  ...(traitConfig === null || traitConfig === void 0
                    ? void 0
                    : traitConfig.resetOn)
                ),
                mapTo(allActions.reset())
              );
            });
        }
      }
      ResetEffect.decorators = [{ type: Injectable }];
      return (
        (_a =
          traitConfig === null || traitConfig === void 0
            ? void 0
            : traitConfig.resetOn) === null || _a === void 0
          ? void 0
          : _a.length
      )
        ? [ResetEffect]
        : [];
    },
  });
}

/**
 * Generates the typical ngrx code need to make a async action with
 * a request, success and failure actions, plus a status property to track its progress
 * and selectors to query the status.
 *
 * @param options - Config object for the trait factory
 * @param options.name - Name of the main request action, should be in camel case
 * @param options.actionProps - Optional param for the main request action, use the props()
 * function for its value, if not present action will have no params,
 * @param options.actionSuccessProps - Optional param for the request success action,
 * use the props() function for its value, if not present action success will have no params
 * @param options.actionFailProps - Optional param for the request fail action,
 * use the props() function for its value, if not present action fail will have no params
 * @returns the trait factory
 *
 * @example
 * // The following trait config
 * const traits = createEntityFeatureFactory(
 * addAsyncAction({
 *        name: 'createClient',
 *        actionProps: props<{ name: string }>(),
 *        actionSuccessProps: props<{ id: string }>(),
 *      }),
 * )({
 *      actionsGroupKey: 'Client',
 *      featureSelector: createFeatureSelector<AsyncActionState<'createClient'>>(
 *        'client',
 *      ),
 *    });
 * // will generate the actions and selectors
 * traits.actions.createClient({name:'Pedro'})
 * traits.actions.createClientSuccess({id:'123'})
 * traits.actions.createClientFail();
 * traits.selectors.isLoadingCreateClient
 * traits.selectors.isSuccessCreateClient
 * traits.selectors.isFailCreateClient
 */
function addAsyncAction({
  name,
  actionProps,
  actionSuccessProps,
  actionFailProps,
}) {
  const nameAsSentence = camelCaseToSentence(name);
  let internalActions;
  return createTraitFactory({
    key: name + '-call',
    config: {
      name,
      actionProps,
      actionSuccessProps,
      actionFailProps,
    },
    actions: ({ actionsGroupKey }) => {
      internalActions = {
        request: actionProps
          ? createAction(`${actionsGroupKey} ${nameAsSentence}`, actionProps)
          : createAction(`${actionsGroupKey} ${nameAsSentence}`),
        requestSuccess: actionSuccessProps
          ? createAction(
              `${actionsGroupKey} ${nameAsSentence} Success`,
              actionSuccessProps
            )
          : createAction(`${actionsGroupKey} ${nameAsSentence} Success`),
        requestFail: actionFailProps
          ? createAction(
              `${actionsGroupKey} ${nameAsSentence} Failure`,
              actionFailProps
            )
          : createAction(`${actionsGroupKey} ${nameAsSentence} Failure`),
      };
      if (name) {
        return {
          [`${name}`]: internalActions.request,
          [`${name}Success`]: internalActions.requestSuccess,
          [`${name}Fail`]: internalActions.requestFail,
        };
      }
      return internalActions;
    },
    selectors: () => {
      function isLoadingEntity(state) {
        return state[`${name}Status`] === 'loading';
      }
      function isSuccessEntity(state) {
        return state[`${name}Status`] === 'success';
      }
      function isFailEntity(state) {
        return state[`${name}Status`] === 'fail';
      }
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      return {
        [`isLoading${capitalizedName}`]: isLoadingEntity,
        [`isSuccess${capitalizedName}`]: isSuccessEntity,
        [`isFail${capitalizedName}`]: isFailEntity,
      };
    },
    initialState: ({ previousInitialState }) => previousInitialState,
    reducer: ({ initialState }) => {
      return createReducer(
        initialState,
        on(internalActions.request, (state) =>
          Object.assign(Object.assign({}, state), {
            [`${name}Status`]: 'loading',
          })
        ),
        on(internalActions.requestFail, (state) =>
          Object.assign(Object.assign({}, state), { [`${name}Status`]: 'fail' })
        ),
        on(internalActions.requestSuccess, (state) =>
          Object.assign(Object.assign({}, state), {
            [`${name}Status`]: 'success',
          })
        )
      );
    },
  });
}
function camelCaseToSentence(text) {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Generates ngrx code needed to load and entity and store it in a state
 * @param entityName - Entity name, should be in camel case
 * @param options.actionProps - Optional param for the main request action,
 * use the props() function for its value, if not present action will have no params,
 * @param options.actionSuccessProps - Optional param for the request success
 * action, use the props() function for its value, if not present action success will have no params
 * @param options.actionFailProps - Optional param for the request fail action,
 * use the props() function for its value, if not present action fail will have no params
 * @returns the trait factory
 *
 * @example
 * const traits = createEntityFeatureFactory(
 * ...addLoadEntity({
 *        entityName: 'client',
 *        requestProps: props<{ id: string }>(),
 *        responseProps: props<{ client: Client }>(),
 *      }),
 * )({
 *      actionsGroupKey: 'Client',
 *      featureSelector: createFeatureSelector<
 *        LoadEntityState<Client, 'client'>
 *        >('client'),
 *    });
 *
 * // will generate
 * traits.actions.loadClient({id:123});
 * traits.actions.loadClientSuccess({client: {id: '123', name: 'gabs'}});
 * traits.actions.loadClientFail();
 * traits.selectors.selectClient
 * traits.selectors.isLoadingLoadClient
 * traits.selectors.isSuccessLoadClient
 * traits.selectors.isFailLoadClient
 */
function addLoadEntity({
  entityName,
  actionProps,
  actionSuccessProps,
  actionFailProps,
}) {
  const capitalizedName =
    entityName.charAt(0).toUpperCase() + entityName.slice(1);
  return [
    addAsyncAction({
      name: 'load' + capitalizedName,
      actionProps,
      actionSuccessProps,
      actionFailProps,
    }),
    createTraitFactory({
      key: `load${capitalizedName}`,
      config: { entityName, actionProps, actionSuccessProps, actionFailProps },
      selectors: () => {
        function selectEntity(state) {
          return state[`${entityName}`];
        }
        return {
          [`select${capitalizedName}`]: selectEntity,
        };
      },
      initialState: ({ previousInitialState }) => previousInitialState,
      reducer: ({ initialState, allActions }) => {
        return createReducer(
          initialState,
          on(allActions[`load${capitalizedName}Success`], (state, action) =>
            Object.assign(Object.assign({}, state), {
              [entityName]: action[entityName],
            })
          )
        );
      },
    }),
  ];
}

/**
 * Generated bundle index. Do not edit.
 */

export {
  ChangeType,
  addAsyncAction,
  addCrudEntities,
  addFilter,
  addLoadEntities,
  addLoadEntity,
  addMultiSelection,
  addPagination,
  addReset,
  addSingleSelection,
  addSort,
  crudTraitKey,
  filterTraitKey,
  loadEntitiesTraitKey,
  multiClearSelection,
  multiDeselect,
  multiSelect,
  multiToggleSelect,
  paginationTraitKey,
  selectTotalSelected,
  singleSelectionTraitKey,
  sortData,
  sortTraitKey,
};
//# sourceMappingURL=ngrx-traits-traits.js.map
