import { TestBed } from '@angular/core/testing';
import {
  createEntityFeatureFactory,
  FeatureSelectors,
} from '@ngrx-traits/core';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { Dictionary } from '@ngrx/entity';
import { createAction, createFeatureSelector } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { first, take, toArray } from 'rxjs/operators';

import { addCrudEntitiesTrait, CrudEntitiesState } from '../crud-entities';
import {
  addFilterEntitiesTrait,
  FilterEntitiesState,
} from '../filter-entities';
import { ƟFilterEntitiesActions } from '../filter-entities/filter-entities.model.internal';
import { TestState } from '../filter-entities/filter-entities.trait.spec';
import { addLoadEntitiesTrait } from '../load-entities';
import { Todo, TodoFilter } from '../load-entities/load-entities.trait.spec';
import { CacheType, PageInfoModel } from './entities-pagination.model';
import {
  ƟEntitiesPaginationSelectors,
  ƟPaginationActions,
} from './entities-pagination.model.internal';
import { addEntitiesPaginationTrait } from './entities-pagination.trait';

export interface PaginationTestState
  extends TestState,
    FilterEntitiesState<TodoFilter> {}
export interface PaginationTestState2
  extends TestState,
    CrudEntitiesState<Todo> {}

describe('Pagination Test', () => {
  let actions$: Actions;

  const todos: Todo[] = new Array(135)
    .fill(null)
    .map((v, i) => ({ id: i, content: 'content ' + i }));

  function initWithFilterAndPagination(
    cacheType: CacheType = 'full',
    remoteFilter = true,
  ) {
    const featureSelector = createFeatureSelector<PaginationTestState>('test');
    const traits = createEntityFeatureFactory(
      { entityName: 'entity', entitiesName: 'entities' },
      addLoadEntitiesTrait<Todo>(),
      remoteFilter
        ? addFilterEntitiesTrait<Todo, TodoFilter>()
        : addFilterEntitiesTrait<Todo, TodoFilter>({
            filterFn: (filter, entity) =>
              !filter?.content ||
              !!entity?.content
                ?.toLowerCase()
                .includes(filter.content.toLowerCase()),
          }),
      addEntitiesPaginationTrait<Todo>({ cacheType, pageSize: 20 }),
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
      { entityName: 'entity', entitiesName: 'entities' },
      addLoadEntitiesTrait<Todo>(),
      addCrudEntitiesTrait<Todo>(),
      addEntitiesPaginationTrait<Todo>({ cacheType, pageSize: 20 }),
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
    total = todos.length,
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
      const { initialState, reducer, actions } = initWithFilterAndPagination();

      const state = reducer(
        initialState,
        actions.loadEntitiesPage({ index: 3 }),
      );

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
      const { initialState, reducer, actions } = initWithFilterAndPagination();
      const a = actions as unknown as ƟPaginationActions;
      const state = reducer(
        initialState,
        a.setEntitiesRequestPage({ index: 2 }),
      );

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
      const { initialState, reducer, actions } = initWithFilterAndPagination();

      const state = reducer(initialState, actions.loadEntitiesPageSuccess());

      expect(state).toEqual({
        ...initialState,
        status: 'success',
      });
    });

    it('loadEntitiesPageFail should store set status to fail ', () => {
      const { initialState, reducer, actions } = initWithFilterAndPagination();

      const state = reducer(initialState, actions.loadEntitiesPageFail());

      expect(state).toEqual({
        ...initialState,
        status: 'fail',
      });
    });

    it('clearPagesCache should reset pagination cache state ', () => {
      const { initialState, reducer, actions } = initWithFilterAndPagination();

      const s = {
        ...initialState,
        pagination: {
          ...initialState.pagination,
          currentPage: 4,
          total: 1000,
          cache: { ...initialState.pagination.cache, start: 20, end: 60 },
        },
      };
      const state = reducer(s, actions.clearEntitiesPagesCache());

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
        initWithFilterAndPagination('full');

      const state = reducer(
        initialState,
        actions.loadEntitiesSuccess({
          entities: todos,
          total: todos.length,
        }),
      );
      // reset(getTimeSpy);
      expect(state).toEqual(pageState(state, todos, 0, 0, 135));
    });

    it('loadEntitiesSuccess for pagination cache partial should load all pages as it pages', () => {
      const { initialState, reducer, actions } =
        initWithFilterAndPagination('partial');

      // check first 3 pages
      const first3pages = todos.slice(0, 60);

      let state = reducer(
        initialState,
        actions.loadEntitiesPage({
          index: 0,
        }),
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: first3pages,
          total: todos.length,
        }),
      );

      expect(state).toEqual(pageState(state, first3pages, 0, 0, 60));

      // check next 3 pages
      const next3pages = todos.slice(60, 120);
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 3,
        }),
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: next3pages,
          total: todos.length,
        }),
      );
      expect(state).toEqual(pageState(state, next3pages, 3, 60, 120));

      // check last 3 pages
      const last3pages = todos.slice(120, todos.length);
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 6,
        }),
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: last3pages,
          total: todos.length,
        }),
      );
      expect(state).toEqual(pageState(state, last3pages, 6, 120, 135));

      // jump back to page 2  pages
      const page2To4 = todos.slice(20, 80);
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 1,
        }),
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: page2To4,
          total: todos.length,
        }),
      );
      expect(state).toEqual(pageState(state, page2To4, 1, 20, 80));
    });

    it('loadEntitiesSuccess for pagination cache grow should load all pages as it pages', () => {
      const { initialState, reducer, actions } =
        initWithFilterAndPagination('grow');

      // check first 3 pages
      const first3pages = todos.slice(0, 60);

      let state = reducer(
        initialState,
        actions.loadEntitiesPage({
          index: 0,
        }),
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: first3pages,
          total: todos.length,
        }),
      );

      expect(state).toEqual(pageState(state, first3pages, 0, 0, 60));

      // check next 3 pages
      const next3pages = todos.slice(60, 120);
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 3,
        }),
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: next3pages,
          total: todos.length,
        }),
      );
      expect(state).toEqual(
        pageState(state, [...first3pages, ...next3pages], 3, 0, 120),
      );

      // check last 3 pages
      const last3pages = todos.slice(120, todos.length);
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 6,
        }),
      );
      state = reducer(
        state,
        actions.loadEntitiesSuccess({
          entities: last3pages,
          total: todos.length,
        }),
      );
      expect(state).toEqual(
        pageState(
          state,
          [...first3pages, ...next3pages, ...last3pages],
          6,
          0,
          135,
        ),
      );
    });

    describe('pagination with filter', () => {
      it('when local filter and full cache filter action should recalculate pagination', () => {
        const { initialState, reducer, actions, selectors } =
          initWithFilterAndPagination('full', false);

        const first3pages = todos.slice(0, 60);

        let state = reducer(
          initialState,
          actions.loadEntitiesPage({
            index: 0,
          }),
        );
        state = reducer(
          state,
          actions.loadEntitiesSuccess({
            entities: first3pages,
            total: 60,
          }),
        );
        state = reducer(
          state,
          actions.loadEntitiesPage({
            index: 2,
          }),
        );

        state = reducer(
          state,
          (
            actions as unknown as ƟFilterEntitiesActions<TodoFilter>
          ).storeEntitiesFilter({ filters: { content: '10' } }),
        );
        expect(
          selectors.selectEntitiesCurrentPageInfo.projector(state),
        ).toEqual({
          pageIndex: 0,
          total: 1,
          pageSize: 20,
          pagesCount: 1,
          hasPrevious: false,
          hasNext: false,
          cacheType: 'full',
        });
      });
      it('when remote filter and partial cache filter action should recalculate pagination', () => {
        const { initialState, reducer, actions } =
          initWithFilterAndPagination('partial');

        const first3pages = todos.slice(0, 60);

        let state = reducer(
          initialState,
          actions.loadEntitiesPage({
            index: 0,
          }),
        );
        state = reducer(
          state,
          actions.loadEntitiesSuccess({
            entities: first3pages,
            total: todos.length,
          }),
        );
        state = reducer(
          state,
          actions.loadEntitiesPage({
            index: 2,
          }),
        );

        state = reducer(
          state,
          (
            actions as unknown as ƟFilterEntitiesActions<TodoFilter>
          ).storeEntitiesFilter({ filters: { content: 'something' } }),
        );
        state = reducer(
          state,
          actions.loadEntitiesSuccess({
            entities: todos.slice(40, 60),
            total: 20,
          }),
        );
        expect(state).toEqual({
          ...state,
          pagination: {
            ...state.pagination,
            currentPage: 0,
            total: 20,
            cache: { ...state.pagination.cache, start: 0, end: 20 },
          },
        });
      });
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
        const state = reducer(s, actions.removeAllEntities());

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
          actions.loadEntitiesPage({
            index: 0,
          }),
        );
        state = reducer(
          state,
          actions.loadEntitiesSuccess({
            entities: todos,
            total: todos.length,
          }),
        );

        const resultState = reducer(
          state,
          actions.addEntities(
            { id: 123123, content: 'some' },
            { id: 324324, content: 'some2' },
          ),
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
          actions.loadEntitiesPage({
            index: 0,
          }),
        );
        state = reducer(
          state,
          actions.loadEntitiesSuccess({
            entities: todos,
            total: todos.length,
          }),
        );

        const resultState = reducer(state, actions.removeEntities(1, 2));

        expect(resultState.pagination).toEqual({
          ...state.pagination,
          currentPage: 0,
          total: todos.length - 2,
        });
      });
    });
  });

  describe('selectors', () => {
    it('selectEntitiesCurrentPageList should the return entities array for each page', () => {
      const { selectors, initialState, reducer, actions } =
        initWithFilterAndPagination();
      let state = pageState(initialState, todos, 2, 0, 75);
      // if no page return currentPage
      expect(selectors.selectEntitiesCurrentPageList.projector(state)).toEqual(
        todos.slice(40, 60),
      );
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 0,
        }),
      );
      expect(selectors.selectEntitiesCurrentPageList.projector(state)).toEqual(
        todos.slice(0, 20),
      );
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 1,
        }),
      );
      expect(selectors.selectEntitiesCurrentPageList.projector(state)).toEqual(
        todos.slice(20, 40),
      );
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 2,
        }),
      );
      expect(selectors.selectEntitiesCurrentPageList.projector(state)).toEqual(
        todos.slice(40, 60),
      );
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 3,
        }),
      );
      expect(selectors.selectEntitiesCurrentPageList.projector(state)).toEqual(
        todos.slice(60, 75),
      );
    });

    it('isEntitiesCurrentPageInCache and  should return true or false deping on the page', () => {
      const {
        selectors: s,
        initialState,
        reducer,
        actions,
      } = initWithFilterAndPagination();
      const selectors = s as unknown as FeatureSelectors<
        TestState,
        ƟEntitiesPaginationSelectors<Todo>
      >;
      //TODO check with cache valid and disabled
      let state = pageState(initialState, todos, 2, 0, 60);
      // using currentPage
      expect(selectors.isEntitiesCurrentPageInCache.projector(state)).toEqual(
        true,
      );
      expect(selectors.isEntitiesNextPageInCache.projector(state)).toEqual(
        false,
      );
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 0,
        }),
      );
      // using explicit page
      expect(selectors.isEntitiesCurrentPageInCache.projector(state)).toEqual(
        true,
      );
      expect(selectors.isEntitiesNextPageInCache.projector(state)).toEqual(
        true,
      );
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 1,
        }),
      );
      expect(selectors.isEntitiesCurrentPageInCache.projector(state)).toEqual(
        true,
      );
      expect(selectors.isEntitiesNextPageInCache.projector(state)).toEqual(
        true,
      );
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 2,
        }),
      );
      expect(selectors.isEntitiesCurrentPageInCache.projector(state)).toEqual(
        true,
      );
      expect(selectors.isEntitiesNextPageInCache.projector(state)).toEqual(
        false,
      );
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 3,
        }),
      );
      expect(selectors.isEntitiesCurrentPageInCache.projector(state)).toEqual(
        false,
      );
      expect(selectors.isEntitiesNextPageInCache.projector(state)).toEqual(
        false,
      );
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 4,
        }),
      );
      expect(selectors.isEntitiesCurrentPageInCache.projector(state)).toEqual(
        false,
      );
      expect(selectors.isEntitiesNextPageInCache.projector(state)).toEqual(
        false,
      );
      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 5,
        }),
      );
      expect(selectors.isEntitiesCurrentPageInCache.projector(state)).toEqual(
        false,
      );
      expect(selectors.isEntitiesNextPageInCache.projector(state)).toEqual(
        false,
      );
    });

    it('selectEntitiesCurrentPage ', () => {
      const { selectors, initialState, reducer, actions } =
        initWithFilterAndPagination();
      let state = pageState(initialState, todos.slice(0, 75), 2, 0, 75, 75);
      expect(selectors.selectEntitiesCurrentPage.projector(state)).toEqual({
        entities: todos.slice(40, 60),
        isLoading: false,
        pageIndex: 2,
        total: 75,
        pageSize: 20,
        pagesCount: 4,
        hasPrevious: true,
        hasNext: true,
        cacheType: 'full',
      });

      state = reducer(
        state,
        actions.loadEntitiesPage({
          index: 0,
        }),
      );
      expect(
        selectors.selectEntitiesCurrentPage.projector(
          pageState(initialState, todos.slice(0, 75), 1, 0, 75, 75),
        ),
      ).toEqual({
        entities: todos.slice(20, 40),
        isLoading: false,
        pageIndex: 1,
        total: 75,
        pageSize: 20,
        pagesCount: 4,
        hasPrevious: true,
        hasNext: true,
        cacheType: 'full',
      });
    });

    it('selectEntitiesCurrentPageInfo ', () => {
      const { selectors, initialState } = initWithFilterAndPagination();
      expect(
        selectors.selectEntitiesCurrentPageInfo.projector(
          pageState(initialState, todos.slice(0, 75), 0, 0, 75, 75),
        ),
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
        selectors.selectEntitiesCurrentPageInfo.projector(
          pageState(initialState, todos.slice(0, 75), 1, 0, 75, 75),
        ),
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
        selectors.selectEntitiesCurrentPageInfo.projector(
          pageState(initialState, todos.slice(0, 75), 2, 0, 75, 75),
        ),
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
        selectors.selectEntitiesCurrentPageInfo.projector(
          pageState(initialState, todos.slice(0, 75), 3, 0, 75, 75),
        ),
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

    it('selectEntitiesPagedRequest ', () => {
      const { selectors, initialState } = initWithFilterAndPagination();
      expect(
        selectors.selectEntitiesPagedRequest.projector(initialState),
      ).toEqual({
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
        75,
      );
      expect(
        selectors.selectEntitiesPagedRequest.projector({
          ...testState,
          pagination: { ...testState.pagination, requestPage: 3 },
        }),
      ).toEqual({
        page: 3,
        size: 60,
        startIndex: 60,
      });
    });

    it('isLoadingEntitiesPage should return false if status is loading and currentPage is different to requestPage', () => {
      const { selectors, initialState } = initWithFilterAndPagination();

      const testState = pageState(
        initialState,
        todos.slice(0, 75),
        2,
        0,
        75,
        75,
      );
      expect(
        selectors.isLoadingEntitiesCurrentPage.projector({
          ...testState,
          status: 'loading',
          pagination: { ...testState.pagination, requestPage: 3 },
        }),
      ).toEqual(false);
    });

    it('isLoadingEntitiesPage should return true if status is loading and currentPage is same to requestPage', () => {
      const { selectors, initialState } = initWithFilterAndPagination();

      const testState = pageState(
        initialState,
        todos.slice(0, 75),
        3,
        0,
        75,
        75,
      );
      expect(
        selectors.isLoadingEntitiesCurrentPage.projector({
          ...testState,
          status: 'loading',
          pagination: { ...testState.pagination, requestPage: 3 },
        }),
      ).toEqual(true);
    });

    it('isLoadingEntitiesPage should return false if status is success and currentPage is same to requestPage', () => {
      const { selectors, initialState } = initWithFilterAndPagination();

      const testState = pageState(
        initialState,
        todos.slice(0, 75),
        3,
        0,
        75,
        75,
      );
      expect(
        selectors.isLoadingEntitiesCurrentPage.projector({
          ...testState,
          status: 'success',
          pagination: { ...testState.pagination, requestPage: 3 },
        }),
      ).toEqual(false);
    });
  });

  describe('effects', () => {
    it('should fire loadEntitiesPage(0) if loadEntitiesFirstPage was fired ', async () => {
      const { effects, actions } = initWithFilterAndPagination();
      actions$ = of(actions.loadEntitiesFirstPage());
      const action = await effects.loadFirstPage$.pipe(first()).toPromise();
      expect(action).toEqual(actions.loadEntitiesPage({ index: 0 }));
    });

    describe('loadPreviousPage$', () => {
      it('should fire loadEntitiesPage(1) if loadEntitiesPreviousPage was fired and current page is 2 ', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithFilterAndPagination();
        mockStore.overrideSelector(selectors.selectEntitiesCurrentPageInfo, {
          hasPrevious: true,
          pageIndex: 2,
        } as PageInfoModel);
        actions$ = of(actions.loadEntitiesPreviousPage());
        const action = await effects.loadPreviousPage$
          .pipe(first())
          .toPromise();
        expect(action).toEqual(actions.loadEntitiesPage({ index: 1 }));
      });

      it('should fire loadEntitiesPageFail() if loadEntitiesPreviousPage was there is no previous page ', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithFilterAndPagination();
        mockStore.overrideSelector(selectors.selectEntitiesCurrentPageInfo, {
          hasPrevious: false,
          pageIndex: 0,
        } as PageInfoModel);
        actions$ = of(actions.loadEntitiesPreviousPage());
        const action = await effects.loadPreviousPage$
          .pipe(first())
          .toPromise();
        expect(action).toEqual(actions.loadEntitiesPageFail());
      });
    });

    describe('loadEntitiesNextPage$', () => {
      it('should fire loadEntitiesPage(3) if loadEntitiesNextPage was fired and current page is 2 ', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithFilterAndPagination();
        mockStore.overrideSelector(selectors.selectEntitiesCurrentPageInfo, {
          hasNext: true,
          pageIndex: 2,
        } as PageInfoModel);
        actions$ = of(actions.loadEntitiesNextPage());
        const action = await effects.loadNextPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadEntitiesPage({ index: 3 }));
      });

      it('should fire loadEntitiesPageFail() if loadEntitiesNextPage was there is no next page ', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithFilterAndPagination();
        mockStore.overrideSelector(selectors.selectEntitiesCurrentPageInfo, {
          hasNext: false,
          pageIndex: 2,
        } as PageInfoModel);
        actions$ = of(actions.loadEntitiesNextPage());
        const action = await effects.loadNextPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadEntitiesPageFail());
      });
    });

    describe('loadEntitiesLastPage$', () => {
      it('should fire loadEntitiesPage(9) if loadEntitiesLastPage was fired and pagesCount is 10 ', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithFilterAndPagination();
        mockStore.overrideSelector(selectors.selectEntitiesCurrentPageInfo, {
          hasNext: true,
          pageIndex: 2,
          pagesCount: 10,
        } as PageInfoModel);
        actions$ = of(actions.loadEntitiesLastPage());
        const action = await effects.loadLastPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadEntitiesPage({ index: 9 }));
      });

      it('should fire loadEntitiesPageFail() if loadEntitiesLastPage was there is no next page ', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithFilterAndPagination();
        mockStore.overrideSelector(selectors.selectEntitiesCurrentPageInfo, {
          hasNext: false,
          pageIndex: 2,
        } as PageInfoModel);
        actions$ = of(actions.loadEntitiesLastPage());
        const action = await effects.loadLastPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadEntitiesPageFail());
      });
    });

    describe('loadPage$', () => {
      it('when loadPage is fired should trigger loadEntitiesPageSuccess if isEntitiesPageInCache is true ', async () => {
        const {
          effects,
          selectors: s,
          actions,
          mockStore,
        } = initWithFilterAndPagination();
        const selectors = s as unknown as FeatureSelectors<
          TestState,
          ƟEntitiesPaginationSelectors<Todo>
        >;
        actions$ = of(actions.loadEntitiesPage({ index: 1 }));
        mockStore.overrideSelector(
          selectors.isEntitiesCurrentPageInCache,
          true,
        );
        const action = await effects.loadPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadEntitiesPageSuccess());
      });

      it('when loadPage is fired should trigger loadEntities if isEntitiesPageInCache is false ', async () => {
        const {
          effects,
          selectors: s,
          actions,
          mockStore,
        } = initWithFilterAndPagination();
        const selectors = s as unknown as FeatureSelectors<
          TestState,
          ƟEntitiesPaginationSelectors<Todo>
        >;
        actions$ = of(actions.loadEntitiesPage({ index: 1 }));
        mockStore.overrideSelector(
          selectors.isEntitiesCurrentPageInCache,
          false,
        );
        const action = await effects.loadPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadEntities());
      });

      it('when loadEntitiesPage is fired should trigger loadEntities if isEntitiesPageInCache is true and forceLoad is true ', async () => {
        const {
          effects,
          selectors: s,
          actions,
          mockStore,
        } = initWithFilterAndPagination();
        const selectors = s as unknown as FeatureSelectors<
          TestState,
          ƟEntitiesPaginationSelectors<Todo>
        >;
        actions$ = of(actions.loadEntitiesPage({ index: 1, forceLoad: true }));
        mockStore.overrideSelector(
          selectors.isEntitiesCurrentPageInCache,
          true,
        );
        const action = await effects.loadPage$.pipe(first()).toPromise();
        expect(action).toEqual(actions.loadEntities());
      });
    });

    describe('preloadEntitiesNextPage$', () => {
      async function init(
        cacheType: CacheType,
        total: number | null = 10 * 20,
        hasNext = true,
        isEntitiesPageInCache = false,
      ) {
        const {
          effects,
          selectors: s,
          actions,
          mockStore,
        } = initWithFilterAndPagination(cacheType);
        const selectors = s as unknown as FeatureSelectors<
          TestState,
          ƟEntitiesPaginationSelectors<Todo>
        >;
        actions$ = of(actions.loadEntitiesPageSuccess());
        mockStore.overrideSelector(
          selectors.isEntitiesNextPageInCache,
          isEntitiesPageInCache,
        );
        mockStore.overrideSelector(selectors.selectEntitiesCurrentPageInfo, {
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
        // expect(action).toEqual([
        //   (actions as unknown as ƟPaginationActions).setEntitiesRequestPage({
        //     index: 4,
        //   }),
        //   actions.loadEntities(),
        // ]);
      });

      it('call loadEntities with nextPage if currentPage is the last cached page and cacheType is grow ', async () => {
        const { actions, action } = await init('partial');
        expect(action).toEqual([
          (actions as unknown as ƟPaginationActions).setEntitiesRequestPage({
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
