import { TestBed } from '@angular/core/testing';
import { PaginationState } from '../pagination';
import { addLoadEntities } from './load-entities.trait';
import { createAction, createFeatureSelector } from '@ngrx/store';
import { addPagination } from '../pagination/pagination.trait';
import { Actions } from '@ngrx/effects';
import { EntityAndStatusState } from './load-entities.model';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { addFilter } from '../filter/filter.trait';
import { provideMockActions } from '@ngrx/effects/testing';
import { FilterState } from 'ngrx-traits/traits';

export interface Todo {
  id: number;
  content?: string;
}

export interface TodoFilter {
  content?: string;
  extra?: string;
}

export interface TestState
  extends EntityAndStatusState<Todo>{}

export interface TestState2
  extends EntityAndStatusState<Todo>,
    PaginationState {}
export interface TestState3
  extends EntityAndStatusState<Todo>,
    FilterState<TodoFilter> {}

describe('addLoadEntities Trait', () => {
  let actions$: Actions;

  function init() {
    const featureSelector = createFeatureSelector<TestState>('test');
    const traits = createEntityFeatureFactory(
      addLoadEntities<Todo>()
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector,
    });

    TestBed.configureTestingModule({
      providers: [provideMockActions(() => actions$), provideMockStore()],
    });
    const mockStore = TestBed.inject(MockStore);
    return { ...traits, mockStore };
  }

  function initWithPagination() {
    const featureSelector = createFeatureSelector<TestState2>('test');
    const traits = createEntityFeatureFactory(
      addLoadEntities<Todo>(),
      addPagination<Todo>()
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector,
    });
    TestBed.configureTestingModule({
      providers: [
        traits.effects[0],
        provideMockActions(() => actions$),
        provideMockStore(),
      ],
    });
    const mockStore = TestBed.inject(MockStore);
    return { ...traits, effects: TestBed.inject(traits.effects[0]), mockStore };
  }

  function initWithLocalFilter(data: Todo[], filter: TodoFilter) {
    const featureSelector = createFeatureSelector<TestState3>('test');
    const traits = createEntityFeatureFactory(
      addLoadEntities<Todo>(),
      addFilter<Todo, TodoFilter>({
        defaultFilter: filter,
        filterFn: (filter: TodoFilter, todo: Todo) =>
          filter?.content && todo.content?.includes(filter.content) || false,
      })
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector,
    });

    const state = traits.reducer(
      traits.initialState,
      traits.actions.fetchSuccess({ entities: data })
    );
    return {
      ...traits,
      initialState: state,
    };
  }

  describe('reducer', () => {
    it('fetchFail should set status to fail', () => {
      const { actions, reducer, initialState } = init();
      const result = reducer(initialState, actions.fetchFail({ error: '' }));
      expect(result).toEqual({ ...initialState, status: 'fail' });
    });

    it('fetch should set status to loading', async () => {
      const { actions, reducer, initialState } = init();
      const result = reducer(initialState, actions.fetch());
      expect(result).toEqual({ ...initialState, status: 'loading' });
    });

    it('fetchSuccess should set status to success', async () => {
      const { actions, reducer, initialState } = init();
      const result = reducer(
        initialState,
        actions.fetchSuccess({
          entities: [{ id: 0 }, { id: 1 }],
          total: 2,
        })
      );
      expect(result).toEqual({
        ...initialState,
        status: 'success',
        entities: { 0: { id: 0 }, 1: { id: 1 } },
        ids: [0, 1],
      });
    });
  });

  describe('reducer with pagination', () => {
    it('when using pagination fetchSuccess should not trigger the loadEntities fetchSuccess mutator', async () => {
      const { actions, reducer, initialState } = initWithPagination();
      const result = reducer(
        initialState,
        actions.fetchSuccess({
          entities: [{ id: 0 }, { id: 1 }],
          total: 2,
        })
      );

      expect(result).not.toEqual({
        ...initialState,
        status: 'success',
        entities: { 0: { id: 0 }, 1: { id: 1 } },
        ids: [0, 1],
      });
    });
  });

  describe('selectors', () => {
    it('check isLoading ', () => {
      const { selectors, initialState } = init();
      expect(
        selectors.isLoading.projector({ ...initialState, status: 'loading' })
      ).toBe(true);
      expect(
        selectors.isLoading.projector({ ...initialState, status: 'fail' })
      ).toBe(false);
      expect(
        selectors.isLoading.projector({ ...initialState, status: 'success' })
      ).toBe(false);
    });

    it('check isFail ', async () => {
      const { selectors, initialState } = init();
      expect(
        selectors.isFail.projector({ ...initialState, status: 'loading' })
      ).toBe(false);
      expect(
        selectors.isFail.projector({ ...initialState, status: 'fail' })
      ).toBe(true);
      expect(
        selectors.isFail.projector({ ...initialState, status: 'success' })
      ).toBe(false);
    });

    it('check isSuccess ', async () => {
      const { selectors, initialState } = init();
      expect(
        selectors.isSuccess.projector({ ...initialState, status: 'loading' })
      ).toBe(false);
      expect(
        selectors.isSuccess.projector({ ...initialState, status: 'fail' })
      ).toBe(false);
      expect(
        selectors.isSuccess.projector({ ...initialState, status: 'success' })
      ).toBe(true);
    });
  });

  describe('selectors when filter function is present', () => {
    const { selectors, initialState } = initWithLocalFilter(
      [
        { id: 0, content: 'Do unit test' },
        { id: 1, content: 'e2e' },
      ],
      { content: 'e2e' }
    );

    it('check selectAll returns filtered data ', () => {
      expect(selectors.selectAll.projector(initialState)).toEqual([
        { id: 1, content: 'e2e' },
      ]);
    });

    it('check selectEntities returns filtered data ', () => {
      expect(selectors.selectEntities.projector(initialState)).toEqual({
        1: { id: 1, content: 'e2e' },
      });
    });

    it('check selectTotal returns filtered data count ', () => {
      expect(selectors.selectTotal.projector(initialState)).toEqual(1);
    });
  });
});
