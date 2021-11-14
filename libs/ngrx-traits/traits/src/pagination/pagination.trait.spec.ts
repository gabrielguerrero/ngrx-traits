import { Actions } from '@ngrx/effects';
import { createFeatureSelector } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { addLoadEntities } from '../load-entities';
import { Todo, TodoFilter } from '../load-entities/load-entities.trait.spec';
import { addFilter, FilterState } from '../filter';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { addPagination } from '../pagination/pagination.trait';
import { TestState } from '../filter/filter.trait.spec';
import { CacheType, PageInfoModel } from '../pagination/pagination.model';
import { of } from 'rxjs';
import { first, take, toArray } from 'rxjs/operators';
import { addCrudEntities, CrudState } from '../crud';

import { Dictionary } from '@ngrx/entity';
import { ƟPaginationActions } from './pagination.model.internal';

export interface PaginationTestState
  extends TestState,
    FilterState<TodoFilter> {}
export interface PaginationTestState2 extends TestState, CrudState<Todo> {}
describe('Pagination Test', () => {
  let actions$: Actions;

  const todos: Todo[] = new Array(135)
    .fill(null)
    .map((v, i) => ({ id: i, content: 'content ' + i }));

  function initWithRemoteFilterWithPagination(cacheType: CacheType = 'full') {
    const featureSelector = createFeatureSelector<PaginationTestState>('test');
    const traits = createEntityFeatureFactory(
      addLoadEntities<Todo>(),
      addFilter<Todo, TodoFilter>(),
      addPagination<Todo>({ cacheType })
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector,
    });
    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        traits.effects[0],
        provideMockActions(() => actions$),
      ],
    });
    const mockStore = TestBed.inject(MockStore);
    return { ...traits, effects: TestBed.inject(traits.effects[0]), mockStore };
  }

  function initWithCrudWithPagination(cacheType: CacheType = 'full') {
    const featureSelector = createFeatureSelector<PaginationTestState2>('test');
    const traits = createEntityFeatureFactory(
      addLoadEntities<Todo>(),
      addCrudEntities<Todo>(),
      addPagination<Todo>({ cacheType })
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector,
    });
    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        traits.effects[0],
        provideMockActions(() => actions$),
      ],
    });
    const mockStore = TestBed.inject(MockStore);
    return { ...traits, effects: TestBed.inject(traits.effects[0]), mockStore };
  }
  function pageState(
    state: TestState,
    result: Todo[],
    currentPage: number,
    start: number,
    end: number,
    total = todos.length
  ): TestState {
    return {
      ...state,
      entities: result.reduce((acc: Dictionary<Todo>, todo) => {
        acc[todo.id] = todo;
        return acc;
      }, {}),
      ids: result.map((v) => v.id),
      status: 'success',
      pagination: {
        ...state.pagination,
        currentPage,
        total,
        cache: { ...state.pagination.cache, start, end },
      },
    };
  }

  describe('reducer', () => {
    it('loadPage should store the index and set status to loading ', () => {
      const { initialState, reducer, actions } =
        initWithRemoteFilterWithPagination();

      const state = reducer(initialState, actions.loadPage({ index: 3 }));

      expect(state).toEqual({
        ...initialState,
        pagination: {
          ...state.pagination,
          currentPage: 3,
          requestPage: 3,
        },
        status: 'loading',
      });
    });

    it('setRequestPage should store the index and set status to loading ', () => {
      const { initialState, reducer, actions } =
        initWithRemoteFilterWithPagination();
      const a = actions as unknown as ƟPaginationActions;
      const state = reducer(initialState, a.setRequestPage({ index: 2 }));

      expect(state).toEqual({
        ...initialState,
        pagination: {
          ...state.pagination,
          requestPage: 2,
        },
        status: 'loading',
      });
    });

    it('loadPageSuccess should store set status to success ', () => {
      const { initialState, reducer, actions } =
        initWithRemoteFilterWithPagination();

      const state = reducer(initialState, actions.loadPageSuccess());

      expect(state).toEqual({
        ...initialState,
        status: 'success',
      });
    });

    it('loadPageFail should store set status to fail ', () => {
      const { initialState, reducer, actions } =
        initWithRemoteFilterWithPagination();

      const state = reducer(initialState, actions.loadPageFail());

      expect(state).toEqual({
        ...initialState,
        status: 'fail',
      });
    });

    it('clearPagesCache should reset pagination cache state ', () => {
      const { initialState, reducer, actions } =
        initWithRemoteFilterWithPagination();

      const s = {
        ...initialState,
        pagination: {
          ...initialState.pagination,
          currentPage: 4,
          total: 1000,
          cache: { ...initialState.pagination.cache, start: 20, end: 60 },
        },
      };
      const state = reducer(s, actions.clearPagesCache());

      expect(state).toEqual({
        ...s,
        pagination: {
          ...state.pagination,
          currentPage: 0,
          total: 0,
          cache: { ...state.pagination.cache, start: 0, end: 0 },
        },
      });
    });

    it('loadEntitiesSuccess for pagination cache full set the cache for the entire result', () => {
      const { initialState, reducer, actions } =
        initWithRemoteFilterWithPagination('full');

      const state = reducer(
        initialState,
        actions.loadEntitiesSuccess({
          entities: todos,
          total: todos.length,
        })
      );
      // reset(getTimeSpy);
      expect(state).toEqual(pageState(state, todos, 0, 0, 135));
    });

    it('loadEntitiesSuccess for pagination cache partial should load all pages as it pages', () => {
      const { initialState, reducer, actions } =
        initWithRemoteFilterWithPagination('partial');

      // check first 3 pages
      const first3pages = todos.slice(0, 60);

      let state = reducer(
        initialState,
        actions.loadPage({
          index: 0,
        })
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: first3pages,
          total: todos.length,
        })
      );

      expect(state).toEqual(pageState(state, first3pages, 0, 0, 60));

      // check next 3 pages
      const next3pages = todos.slice(60, 120);
      state = reducer(
        state,
        actions.loadPage({
          index: 3,
        })
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: next3pages,
          total: todos.length,
        })
      );
      expect(state).toEqual(pageState(state, next3pages, 3, 60, 120));

      // check last 3 pages
      const last3pages = todos.slice(120, todos.length);
      state = reducer(
        state,
        actions.loadPage({
          index: 6,
        })
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: last3pages,
          total: todos.length,
        })
      );
      expect(state).toEqual(pageState(state, last3pages, 6, 120, 135));

      // jump back to page 2  pages
      const page2To4 = todos.slice(20, 80);
      state = reducer(
        state,
        actions.loadPage({
          index: 1,
        })
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: page2To4,
          total: todos.length,
        })
      );
      expect(state).toEqual(pageState(state, page2To4, 1, 20, 80));
    });

    it('loadEntitiesSuccess for pagination cache grow should load all pages as it pages', () => {
      const { initialState, reducer, actions } =
        initWithRemoteFilterWithPagination('grow');

      // check first 3 pages
      const first3pages = todos.slice(0, 60);

      let state = reducer(
        initialState,
        actions.loadPage({
          index: 0,
        })
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: first3pages,
          total: todos.length,
        })
      );

      expect(state).toEqual(pageState(state, first3pages, 0, 0, 60));

      // check next 3 pages
      const next3pages = todos.slice(60, 120);
      state = reducer(
        state,
        actions.loadPage({
          index: 3,
        })
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: next3pages,
          total: todos.length,
        })
      );
      expect(state).toEqual(
        pageState(state, [...first3pages, ...next3pages], 3, 0, 120)
      );

      // check last 3 pages
      const last3pages = todos.slice(120, todos.length);
      state = reducer(
        state,
        actions.loadPage({
          index: 6,
        })
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: last3pages,
          total: todos.length,
        })
      );
      expect(state).toEqual(
        pageState(
          state,
          [...first3pages, ...next3pages, ...last3pages],
          6,
          0,
          135
        )
      );
    });

    describe('pagination with crud', () => {
      it('removeAll action should reset pagination cache', () => {
        const { initialState, reducer, actions } = initWithCrudWithPagination();

        const s = {
          ...initialState,
          pagination: {
            ...initialState.pagination,
            currentPage: 4,
            total: 1000,
            cache: { ...initialState.pagination.cache, start: 20, end: 60 },
          },
        };
        const state = reducer(s, actions.removeAll());

        expect(state).toEqual({
          ...s,
          pagination: {
            ...state.pagination,
            currentPage: 0,
            total: 0,
            cache: { ...state.pagination.cache, start: 0, end: 0 },
          },
        });
      });
      it('add action should update total ', () => {
        const { initialState, reducer, actions } = initWithCrudWithPagination();

        let state = reducer(
          initialState,
          actions.loadPage({
            index: 0,
          })
        );
        state = reducer(
          state,
          actions.loadEntitiesSuccess({
            entities: todos,
            total: todos.length,
          })
        );

        const resultState = reducer(
          state,
          actions.add(
            { id: 123123, content: 'some' },
            { id: 324324, content: 'some2' }
          )
        );

        expect(resultState.pagination).toEqual({
          ...state.pagination,
          currentPage: 0,
          total: todos.length + 2,
        });
      });
      it('remove action should update total ', () => {
        const { initialState, reducer, actions } = initWithCrudWithPagination();

        let state = reducer(
          initialState,
          actions.loadPage({
            index: 0,
          })
        );
        state = reducer(
          state,
          actions.loadEntitiesSuccess({
            entities: todos,
            total: todos.length,
          })
        );

        const resultState = reducer(state, actions.remove(1, 2));

        expect(resultState.pagination).toEqual({
          ...state.pagination,
          currentPage: 0,
          total: todos.length - 2,
        });
      });
    });
  });

  describe('selectors', () => {
    it('selectPageEntities should the rights entities array for each page', () => {
      const { selectors, initialState } = initWithRemoteFilterWithPagination();
      const state = pageState(initialState, todos, 2, 0, 75);
      // if no page return currentPage
      expect(selectors.selectPageEntities.projector(state)).toEqual(
        todos.slice(40, 60)
      );
      // with page parameter
      expect(
        selectors.selectPageEntities.projector(state, { page: 0 })
      ).toEqual(todos.slice(0, 20));
      expect(
        selectors.selectPageEntities.projector(state, { page: 1 })
      ).toEqual(todos.slice(20, 40));
      expect(
        selectors.selectPageEntities.projector(state, { page: 2 })
      ).toEqual(todos.slice(40, 60));
      expect(
        selectors.selectPageEntities.projector(state, { page: 3 })
      ).toEqual(todos.slice(60, 75));
    });

    it('isPageInCache should return true or false deping on the page', () => {
      const { selectors, initialState } = initWithRemoteFilterWithPagination();
      //TODO check with cache valid and disabled
      const state = pageState(initialState, todos, 2, 0, 60);
      // using currentPage
      expect(selectors.isPageInCache.projector(state)).toEqual(true);
      // using explicit page
      expect(selectors.isPageInCache.projector(state, { page: 0 })).toEqual(
        true
      );
      expect(selectors.isPageInCache.projector(state, { page: 1 })).toEqual(
        true
      );
      expect(selectors.isPageInCache.projector(state, { page: 2 })).toEqual(
        true
      );
      expect(selectors.isPageInCache.projector(state, { page: 3 })).toEqual(
        false
      );
      expect(selectors.isPageInCache.projector(state, { page: 4 })).toEqual(
        false
      );
      expect(selectors.isPageInCache.projector(state, { page: 5 })).toEqual(
        false
      );
    });

    it('selectPage ', () => {
      const { selectors, initialState } = initWithRemoteFilterWithPagination();
      expect(
        selectors.selectPage.projector(
          pageState(initialState, todos.slice(0, 75), 2, 0, 75, 75)
        )
      ).toEqual({
        entities: todos.slice(40, 60),
        pageIndex: 2,
        total: 75,
        pageSize: 20,
        pagesCount: 4,
        hasPrevious: true,
        hasNext: true,
        cacheType: 'full',
      });

      expect(
        selectors.selectPage.projector(
          pageState(initialState, todos.slice(0, 75), 2, 0, 75, 75),
          { page: 1 }
        )
      ).toEqual({
        entities: todos.slice(20, 40),
        pageIndex: 2,
        total: 75,
        pageSize: 20,
        pagesCount: 4,
        hasPrevious: true,
        hasNext: true,
        cacheType: 'full',
      });
    });

    it('selectPageInfo ', () => {
      const { selectors, initialState } = initWithRemoteFilterWithPagination();
      expect(
        selectors.selectPageInfo.projector(
          pageState(initialState, todos.slice(0, 75), 0, 0, 75, 75)
        )
      ).toEqual({
        pageIndex: 0,
        total: 75,
        pageSize: 20,
        pagesCount: 4,
        hasPrevious: false,
        hasNext: true,
        cacheType: 'full',
      });
      expect(
        selectors.selectPageInfo.projector(
          pageState(initialState, todos.slice(0, 75), 1, 0, 75, 75)
        )
      ).toEqual({
        pageIndex: 1,
        total: 75,
        pageSize: 20,
        pagesCount: 4,
        hasPrevious: true,
        hasNext: true,
        cacheType: 'full',
      });
      expect(
        selectors.selectPageInfo.projector(
          pageState(initialState, todos.slice(0, 75), 2, 0, 75, 75)
        )
      ).toEqual({
        pageIndex: 2,
        total: 75,
        pageSize: 20,
        pagesCount: 4,
        hasPrevious: true,
        hasNext: true,
        cacheType: 'full',
      });
      expect(
        selectors.selectPageInfo.projector(
          pageState(initialState, todos.slice(0, 75), 3, 0, 75, 75)
        )
      ).toEqual({
        pageIndex: 3,
        total: 75,
        pageSize: 20,
        pagesCount: 4,
        hasPrevious: true,
        hasNext: false,
        cacheType: 'full',
      });
    });

    it('selectPagedRequest ', () => {
      const { selectors, initialState } = initWithRemoteFilterWithPagination();
      expect(selectors.selectPagedRequest.projector(initialState)).toEqual({
        page: 0,
        size: 60,
        startIndex: 0,
      });

      const testState = pageState(
        initialState,
        todos.slice(0, 75),
        3,
        0,
        75,
        75
      );
      expect(
        selectors.selectPagedRequest.projector({
          ...testState,
          pagination: { ...testState.pagination, requestPage: 3 },
        })
      ).toEqual({
        page: 3,
        size: 60,
        startIndex: 60,
      });
    });

    it('isLoadingPage should return false if status is loading and currentPage is different to requestPage', () => {
      const { selectors, initialState } = initWithRemoteFilterWithPagination();

      const testState = pageState(
        initialState,
        todos.slice(0, 75),
        2,
        0,
        75,
        75
      );
      expect(
        selectors.isLoadingPage.projector({
          ...testState,
          status: 'loading',
          pagination: { ...testState.pagination, requestPage: 3 },
        })
      ).toEqual(false);
    });

    it('isLoadingPage should return true if status is loading and currentPage is same to requestPage', () => {
      const { selectors, initialState } = initWithRemoteFilterWithPagination();

      const testState = pageState(
        initialState,
        todos.slice(0, 75),
        3,
        0,
        75,
        75
      );
      expect(
        selectors.isLoadingPage.projector({
          ...testState,
          status: 'loading',
          pagination: { ...testState.pagination, requestPage: 3 },
        })
      ).toEqual(true);
    });

    it('isLoadingPage should return false if status is success and currentPage is same to requestPage', () => {
      const { selectors, initialState } = initWithRemoteFilterWithPagination();

      const testState = pageState(
        initialState,
        todos.slice(0, 75),
        3,
        0,
        75,
        75
      );
      expect(
        selectors.isLoadingPage.projector({
          ...testState,
          status: 'success',
          pagination: { ...testState.pagination, requestPage: 3 },
        })
      ).toEqual(false);
    });
  });

  describe('effects', () => {
    it('should fire loadPage(0) if loadFirstPage was fired ', async () => {
      const { effects, actions } = initWithRemoteFilterWithPagination();
      actions$ = of(actions.loadFirstPage());
      const action = await effects.loadFirstPage$.pipe(first()).toPromise();
      expect(action).toEqual(actions.loadPage({ index: 0 }));
    });

    describe('loadPreviousPage$', () => {
      it('should fire loadPage(1) if loadPreviousPage was fired and current page is 2 ', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithRemoteFilterWithPagination();
        mockStore.overrideSelector(selectors.selectPageInfo, {
          hasPrevious: true,
          pageIndex: 2,
        } as PageInfoModel);
        actions$ = of(actions.loadPreviousPage());
        const action = await effects.loadPreviousPage$
          .pipe(first())
          .toPromise();
        expect(action).toEqual(actions.loadPage({ index: 1 }));
      });

      it('should fire loadPageFail() if loadPreviousPage was there is no previous page ', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithRemoteFilterWithPagination();
        mockStore.overrideSelector(selectors.selectPageInfo, {
          hasPrevious: false,
          pageIndex: 0,
        } as PageInfoModel);
        actions$ = of(actions.loadPreviousPage());
        const action = await effects.loadPreviousPage$
          .pipe(first())
          .toPromise();
        expect(action).toEqual(actions.loadPageFail());
      });
    });

    describe('loadNextPage$', () => {
      it('should fire loadPage(3) if loadNextPage was fired and current page is 2 ', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithRemoteFilterWithPagination();
        mockStore.overrideSelector(selectors.selectPageInfo, {
          hasNext: true,
          pageIndex: 2,
        } as PageInfoModel);
        actions$ = of(actions.loadNextPage());
        const action = await effects.loadNextPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadPage({ index: 3 }));
      });

      it('should fire loadPageFail() if loadNextPage was there is no next page ', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithRemoteFilterWithPagination();
        mockStore.overrideSelector(selectors.selectPageInfo, {
          hasNext: false,
          pageIndex: 2,
        } as PageInfoModel);
        actions$ = of(actions.loadNextPage());
        const action = await effects.loadNextPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadPageFail());
      });
    });

    describe('loadLastPage$', () => {
      it('should fire loadPage(9) if loadLastPage was fired and pagesCount is 10 ', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithRemoteFilterWithPagination();
        mockStore.overrideSelector(selectors.selectPageInfo, {
          hasNext: true,
          pageIndex: 2,
          pagesCount: 10,
        } as PageInfoModel);
        actions$ = of(actions.loadLastPage());
        const action = await effects.loadLastPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadPage({ index: 9 }));
      });

      it('should fire loadPageFail() if loadLastPage was there is no next page ', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithRemoteFilterWithPagination();
        mockStore.overrideSelector(selectors.selectPageInfo, {
          hasNext: false,
          pageIndex: 2,
        } as PageInfoModel);
        actions$ = of(actions.loadLastPage());
        const action = await effects.loadLastPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadPageFail());
      });
    });

    describe('loadPage$', () => {
      it('when loadPage is fired should trigger loadPageSuccess if isPageInCache is true ', async () => {
        const { effects, selectors, actions, mockStore } =
          initWithRemoteFilterWithPagination();
        actions$ = of(actions.loadPage({ index: 1 }));
        mockStore.overrideSelector(selectors.isPageInCache, true);
        const action = await effects.loadPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadPageSuccess());
      });

      it('when loadPage is fired should trigger loadEntities if isPageInCache is false ', async () => {
        const { effects, selectors, actions, mockStore } =
          initWithRemoteFilterWithPagination();
        actions$ = of(actions.loadPage({ index: 1 }));
        mockStore.overrideSelector(selectors.isPageInCache, false);
        const action = await effects.loadPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadEntities());
      });

      it('when loadPage is fired should trigger loadEntities if isPageInCache is true and forceLoad is true ', async () => {
        const { effects, selectors, actions, mockStore } =
          initWithRemoteFilterWithPagination();
        actions$ = of(actions.loadPage({ index: 1, forceLoad: true }));
        mockStore.overrideSelector(selectors.isPageInCache, true);
        const action = await effects.loadPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadEntities());
      });
    });

    describe('preloadNextPage$', () => {
      async function init(
        cacheType: CacheType,
        total: number | null = 10 * 20,
        hasNext = true,
        isPageInCache = false
      ) {
        const { effects, selectors, actions, mockStore } =
          initWithRemoteFilterWithPagination(cacheType);
        actions$ = of(actions.loadPageSuccess());
        mockStore.overrideSelector(selectors.isPageInCache, isPageInCache);
        mockStore.overrideSelector(selectors.selectPageInfo, {
          hasNext,
          pageIndex: 3,
          pagesCount: 10,
          total,
          cacheType,
        } as PageInfoModel);
        const action = await effects.preloadNextPage$
          .pipe(take(2), toArray())
          .toPromise();
        return { actions, action };
      }

      it('call loadEntities with nextPage if currentPage is the last cached page and cacheType is partial', async () => {
        const { actions, action } = await init('partial');
        expect(action).toEqual([
          (actions as unknown as ƟPaginationActions).setRequestPage({
            index: 4,
          }),
          actions.loadEntities(),
        ]);
      });

      it('call loadEntities with nextPage if currentPage is the last cached page and cacheType is grow ', async () => {
        const { actions, action } = await init('partial');
        expect(action).toEqual([
          (actions as unknown as ƟPaginationActions).setRequestPage({
            index: 4,
          }),
          actions.loadEntities(),
        ]);
      });

      it('dont call loadEntities with nextPage if currentPage is the last cached page and cacheType is full ', async () => {
        const { action } = await init('full');
        expect(action).toEqual([]);
      });

      it('dont call loadEntities with nextPage if there is no total ', async () => {
        const { action } = await init('partial', null);
        expect(action).toEqual([]);
      });

      it('dont call loadEntities with nextPage if there is no nextPage ', async () => {
        const { action } = await init('partial', 10 * 20, false);
        expect(action).toEqual([]);
      });

      it('dont call loadEntities with nextPage if next page is in cahce ', async () => {
        const { action } = await init('partial', 10 * 20, true, true);
        expect(action).toEqual([]);
      });
    });
  });
});
