import { TestBed } from '@angular/core/testing';
import { EntitiesPaginationState } from '../entities-pagination';
import { addLoadEntitiesTrait } from './load-entities.trait';
import { createAction, createFeatureSelector } from '@ngrx/store';
import { addEntitiesPaginationTrait } from '../entities-pagination/entities-pagination.trait';
import { Actions } from '@ngrx/effects';
import { LoadEntitiesState } from './load-entities.model';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { createEntityFeatureFactory } from '@ngrx-traits/core';
import { addFilterEntitiesTrait } from '../filter-entities/filter-entities.trait';
import { provideMockActions } from '@ngrx/effects/testing';
import { FilterEntitiesState } from '../filter-entities';

export interface Todo {
  id: number;
  content?: string;
}

export interface TodoFilter {
  content?: string;
  extra?: string;
}

export type TestState = LoadEntitiesState<Todo>;

export interface TestState2
  extends LoadEntitiesState<Todo>,
    EntitiesPaginationState {}
export interface TestState3
  extends LoadEntitiesState<Todo>,
    FilterEntitiesState<TodoFilter> {}

describe('addLoadEntitiesTrait Trait', () => {
  let actions$: Actions;

  function init() {
    const featureSelector = createFeatureSelector<TestState>('test');
    const traits = createEntityFeatureFactory(
      { entityName: 'todo' },
      addLoadEntitiesTrait<Todo>()
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
      { entityName: 'entity', entitiesName: 'entities' },
      addLoadEntitiesTrait<Todo>(),
      addEntitiesPaginationTrait<Todo>()
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
      { entityName: 'entity', entitiesName: 'entities' },
      addLoadEntitiesTrait<Todo>(),
      addFilterEntitiesTrait<Todo, TodoFilter>({
        defaultFilter: filter,
        filterFn: (filter: TodoFilter, todo: Todo) =>
          (filter?.content && todo.content?.includes(filter.content)) || false,
      })
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector,
    });

    const state = traits.reducer(
      traits.initialState,
      traits.actions.loadEntitiesSuccess({ entities: data })
    );
    return {
      ...traits,
      initialState: state,
    };
  }

  describe('reducer', () => {
    it('loadEntitiesFail should set status to fail', () => {
      const { actions, reducer, initialState } = init();
      const result = reducer(
        initialState,
        actions.loadTodosFail({ error: '' })
      );
      expect(result).toEqual({ ...initialState, status: 'fail' });
    });

    it('loadEntities should set status to loading', async () => {
      const { actions, reducer, initialState } = init();
      const result = reducer(initialState, actions.loadTodos());
      expect(result).toEqual({ ...initialState, status: 'loading' });
    });

    it('loadEntitiesSuccess should set status to success', async () => {
      const { actions, reducer, initialState } = init();
      const result = reducer(
        initialState,
        actions.loadTodosSuccess({
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
    it('when using pagination loadEntitiesSuccess should not trigger the loadEntities loadEntitiesSuccess mutator', async () => {
      const { actions, reducer, initialState } = initWithPagination();
      const result = reducer(
        initialState,
        actions.loadEntitiesSuccess({
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
        selectors.isTodosLoading.projector({
          ...initialState,
          status: 'loading',
        })
      ).toBe(true);
      expect(
        selectors.isTodosLoading.projector({
          ...initialState,
          status: 'fail',
        })
      ).toBe(false);
      expect(
        selectors.isTodosLoading.projector({
          ...initialState,
          status: 'success',
        })
      ).toBe(false);
    });

    it('check isFail ', async () => {
      const { selectors, initialState } = init();
      expect(
        selectors.isTodosLoadingFail.projector({
          ...initialState,
          status: 'loading',
        })
      ).toBe(false);
      expect(
        selectors.isTodosLoadingFail.projector({
          ...initialState,
          status: 'fail',
        })
      ).toBe(true);
      expect(
        selectors.isTodosLoadingFail.projector({
          ...initialState,
          status: 'success',
        })
      ).toBe(false);
    });

    it('check isSuccess ', async () => {
      const { selectors, initialState } = init();
      expect(
        selectors.isTodosLoadingSuccess.projector({
          ...initialState,
          status: 'loading',
        })
      ).toBe(false);
      expect(
        selectors.isTodosLoadingSuccess.projector({
          ...initialState,
          status: 'fail',
        })
      ).toBe(false);
      expect(
        selectors.isTodosLoadingSuccess.projector({
          ...initialState,
          status: 'success',
        })
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

    it('check selectEntitiesList returns filtered data ', () => {
      expect(selectors.selectEntitiesIdsList.projector(initialState)).toEqual([
        1,
      ]);
    });

    it('check selectEntitiesList returns filtered data ', () => {
      expect(selectors.selectEntitiesList.projector(initialState)).toEqual([
        { id: 1, content: 'e2e' },
      ]);
    });

    it('check selectEntitiesMap returns filtered data ', () => {
      expect(selectors.selectEntitiesMap.projector(initialState)).toEqual({
        1: { id: 1, content: 'e2e' },
      });
    });

    it('check selectEntitiesTotal returns filtered data count ', () => {
      expect(selectors.selectEntitiesTotal.projector(initialState)).toEqual(1);
    });
  });
});
