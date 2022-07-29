import { Actions } from '@ngrx/effects';
import { createEntityFeatureFactory } from '@ngrx-traits/core';
import { addLoadEntitiesTrait } from '../load-entities';
import { Todo, TodoFilter } from '../load-entities/load-entities.trait.spec';
import { addFilterEntitiesTrait } from '../filter-entities';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { addEntitiesPaginationTrait } from '../entities-pagination';
import { addSortEntitiesTrait } from '../sort-entities';
import { of } from 'rxjs';
import { first } from 'rxjs/operators';
import { addEntitiesSyncToRouteQueryParams } from './entities-sync-to-route-query-params';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';

describe('addEntitiesSyncToRouteQueryParams', () => {
  let actions$: Actions;

  const todos: Todo[] = new Array(135)
    .fill(null)
    .map((v, i) => ({ id: i, content: 'content ' + i }));

  function initWithFilterAndPagination({
    remote = false,
  }: {
    remote?: boolean;
  } = {}) {
    const traits = createEntityFeatureFactory(
      { entityName: 'entity', entitiesName: 'entities' },
      addLoadEntitiesTrait<Todo>(),
      remote
        ? addFilterEntitiesTrait<Todo, TodoFilter>()
        : addFilterEntitiesTrait<Todo, TodoFilter>({
            filterFn: (filter, entity) =>
              !filter?.content ||
              !!entity?.content
                ?.toLowerCase()
                .includes(filter.content.toLowerCase()),
          }),
      addSortEntitiesTrait<Todo>({
        remote,
        defaultSort: { active: 'id', direction: 'asc' },
      }),
      addEntitiesPaginationTrait<Todo>({
        cacheType: remote ? 'partial' : 'full',
        pageSize: 20,
      }),
      addEntitiesSyncToRouteQueryParams()
    )({
      actionsGroupKey: 'test',
      featureSelector: 'test',
    });
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            queryParams: of({
              content: 'content',
              page: 3,
              sortActive: 'id',
              sortDirection: 'asc',
            }),
          }),
        },
        provideMockStore(),
        traits.effects[1],
        provideMockActions(() => actions$),
      ],
    });
    const mockStore = TestBed.inject(MockStore);
    return { ...traits, effects: TestBed.inject(traits.effects[1]), mockStore };
  }

  describe('reducer', () => {
    it('should store filter params when setEntitiesRouteQueryParams is call and has filter params', () => {
      const { reducer, initialState, actions } = initWithFilterAndPagination();
      let state = reducer(
        initialState,
        actions.loadEntitiesSuccess({ entities: todos })
      );
      state = reducer(
        state,
        (actions as any)['setEntitiesRouteQueryParams']({
          params: { content: '1', extra: '2' },
        })
      );
      expect(state.filters).toEqual({ content: '1', extra: '2' });
    });

    it('should store sort params when setEntitiesRouteQueryParams is call and has sort params', () => {
      const { reducer, initialState, actions } = initWithFilterAndPagination();
      let state = reducer(
        initialState,
        actions.loadEntitiesSuccess({ entities: todos })
      );
      state = reducer(
        state,
        (actions as any)['setEntitiesRouteQueryParams']({
          params: { sortActive: 'content', sortDirection: 'asc' },
        })
      );
      expect(state.sort.current).toEqual({
        active: 'content',
        direction: 'asc',
      });
    });

    it('should store page param when setEntitiesRouteQueryParams is call and has page params', () => {
      const { reducer, initialState, actions } = initWithFilterAndPagination();
      let state = reducer(
        initialState,
        actions.loadEntitiesSuccess({ entities: todos })
      );
      state = reducer(
        state,
        (actions as any)['setEntitiesRouteQueryParams']({
          params: { page: '2' },
        })
      );
      expect(state.pagination.currentPage).toEqual(2);
    });

    it('should set page param to 0 if  setEntitiesRouteQueryParams is has no page param', () => {
      const { reducer, initialState, actions } = initWithFilterAndPagination();
      let state = reducer(
        initialState,
        actions.loadEntitiesSuccess({ entities: todos })
      );
      state = reducer(state, actions.loadEntitiesPage({ index: 3 }));
      state = reducer(
        state,
        (actions as any)['setEntitiesRouteQueryParams']({
          params: {},
        })
      );
      expect(state.pagination.currentPage).toEqual(0);
    });

    it('should set sort param to the default sort if  setEntitiesRouteQueryParams is has no sort params', () => {
      const { reducer, initialState, actions } = initWithFilterAndPagination();
      let state = reducer(
        initialState,
        actions.loadEntitiesSuccess({ entities: todos })
      );
      state = reducer(
        state,
        actions.sortEntities({ active: 'content', direction: 'desc' })
      );
      state = reducer(
        state,
        (actions as any)['setEntitiesRouteQueryParams']({
          params: {},
        })
      );
      expect(state.sort.current).toEqual({ active: 'id', direction: 'asc' });
    });

    it('should set filters param to the empty  if  setEntitiesRouteQueryParams is has no filters', () => {
      const { reducer, initialState, actions } = initWithFilterAndPagination();
      let state = reducer(
        initialState,
        actions.loadEntitiesSuccess({ entities: todos })
      );
      state = reducer(
        state,
        actions.filterEntities({ filters: { extra: 'content' } })
      );
      state = reducer(
        state,
        (actions as any)['setEntitiesRouteQueryParams']({
          params: {},
        })
      );
      expect(state.filters).toEqual({});
    });
  });

  describe('effects', () => {
    it(' setEntitiesRouteQueryParams action should call loadEntities', async () => {
      const { actions, effects } = initWithFilterAndPagination();
      actions$ = of(
        (actions as any)['setEntitiesRouteQueryParams']({
          params: { page: '2' },
        })
      );
      const result = await effects.setUrlParams$.pipe(first()).toPromise();
      expect(result).toEqual(actions.loadEntities());
    });

    it('loadEntitiesUsingRouteQueryParams action should call setEntitiesRouteQueryParams with querystring params', async () => {
      const { actions, effects } = initWithFilterAndPagination();
      actions$ = of(actions.loadEntitiesUsingRouteQueryParams());
      const result = await effects.loadUrlParams$.pipe(first()).toPromise();
      expect(result).toEqual(
        (actions as any)['setEntitiesRouteQueryParams']({
          params: {
            content: 'content',
            page: 3,
            sortActive: 'id',
            sortDirection: 'asc',
          },
        })
      );
    });

    it('should update url when filter action is fired', async () => {
      const { actions, effects } = initWithFilterAndPagination();
      actions$ = of(actions.filterEntities({ filters: { content: 'hello' } }));
      const router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate');
      await effects.onFilter$.toPromise();
      expect(router.navigate).toBeCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: { content: 'hello' },
        queryParamsHandling: 'merge',
      });
    });

    it('should update url when sort action is fired', async () => {
      const { actions, effects } = initWithFilterAndPagination();
      actions$ = of(actions.sortEntities({ active: 'id', direction: 'desc' }));
      const router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate');
      await effects.onSort$.toPromise();
      expect(router.navigate).toBeCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: { sortActive: 'id', sortDirection: 'desc' },
        queryParamsHandling: 'merge',
      });
    });

    it('should update url when loadPage action is fired', async () => {
      const { actions, effects } = initWithFilterAndPagination();
      actions$ = of(actions.loadEntitiesPage({ index: 3 }));
      const router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate');
      await effects.onPaginate$.toPromise();
      expect(router.navigate).toBeCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: { page: 3 },
        queryParamsHandling: 'merge',
      });
    });
  });
});
