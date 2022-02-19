import { createFeatureSelector } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { addLoadEntities, LoadEntitiesState } from '../load-entities';
import { addFilterEntities } from '../filter/filter.trait';
import { Todo, TodoFilter } from '../load-entities/load-entities.trait.spec';
import { Actions } from '@ngrx/effects';
import { of } from 'rxjs';
import { first, take, toArray } from 'rxjs/operators';
import { addEntitiesPagination, EntitiesPaginationState } from '../pagination';
import { provideMockActions } from '@ngrx/effects/testing';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { hot, Scheduler } from 'jest-marbles';
import { ƟFilterEntitiesActions } from './filter.model.internal';
import { FilterEntitiesState } from 'ngrx-traits/traits';

export interface TestState
  extends LoadEntitiesState<Todo>,
    EntitiesPaginationState,
    FilterEntitiesState<TodoFilter> {}
export interface TestState2
  extends LoadEntitiesState<Todo>,
    FilterEntitiesState<TodoFilter> {}

describe('addFilter Trait', () => {
  let actions$: Actions;

  function initWithRemoteFilter() {
    const featureSelector = createFeatureSelector<TestState2>('test');
    const traits = createEntityFeatureFactory(
      { entityName: 'entity', entitiesName: 'entities' },
      addLoadEntities<Todo>(),
      addFilterEntities<Todo, TodoFilter>()
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

  function initWithRemoteFilterWithPagination() {
    const featureSelector = createFeatureSelector<TestState>('test');
    const traits = createEntityFeatureFactory(
      { entityName: 'entity', entitiesName: 'entities' },
      addLoadEntities<Todo>(),
      addFilterEntities<Todo, TodoFilter>(),
      addEntitiesPagination<Todo>()
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector,
    });
    TestBed.configureTestingModule({
      providers: [
        traits.effects[1],
        provideMockActions(() => actions$),
        provideMockStore(),
      ],
    });
    return { ...traits, effects: TestBed.inject(traits.effects[1]) };
  }

  // note: local filtering test are in load-entities and pagination traits because most logic belongs there

  describe('reducer', () => {
    it('should storeFilter action should store filters', () => {
      const { reducer, actions, initialState } = initWithRemoteFilter();
      const state = reducer(
        initialState,
        (
          actions as unknown as ƟFilterEntitiesActions<TodoFilter>
        ).storeEntitiesFilter({
          filters: { content: 'x' },
        })
      );
      expect(state.filters).toEqual({ content: 'x' });
    });
  });

  describe('selectors', () => {
    it('selectFilter should return stored filter', () => {
      const { reducer, actions, initialState, selectors } =
        initWithRemoteFilter();
      selectors.selectEntitiesFilter.projector;
      const state = reducer(
        initialState,
        (
          actions as unknown as ƟFilterEntitiesActions<TodoFilter>
        ).storeEntitiesFilter({
          filters: { content: 'x' },
        })
      );
      expect(selectors.selectEntitiesFilter.projector(state)).toEqual({
        content: 'x',
      });
    });
  });

  describe('effects', () => {
    it('should fire loadEntities when storeFilter is fired and no pagination', async () => {
      const { effects, actions } = initWithRemoteFilter();
      actions$ = of(
        (
          actions as unknown as ƟFilterEntitiesActions<TodoFilter>
        ).storeEntitiesFilter({
          filters: { content: 'x' },
        })
      );
      const action = await effects.loadEntities$.pipe(first()).toPromise();
      expect(action).toEqual(actions.loadEntities());
    });

    it('should fire loadFirstPage when storeFilter is fired and has pagination', async () => {
      const { effects, actions } = initWithRemoteFilterWithPagination();
      actions$ = of(
        (
          actions as unknown as ƟFilterEntitiesActions<TodoFilter>
        ).storeEntitiesFilter({
          filters: { content: 'x' },
        })
      );
      const action = await effects.loadEntities$
        .pipe(take(2), toArray())
        .toPromise();
      expect(action).toEqual([
        actions.clearEntitiesPagesCache(),
        actions.loadEntitiesFirstPage(),
      ]);
    });
    describe('storeFilter$', () => {
      it('should fire immediately  storeFilter action after filter if forceLoad is true', async () => {
        const { effects, actions, mockStore, selectors } =
          initWithRemoteFilter();
        mockStore.overrideSelector(selectors.selectEntitiesFilter, {});
        actions$ = of(
          actions.filterEntities({ filters: { content: 'x' }, forceLoad: true })
        );
        const action = await effects
          .storeFilter$({
            debounce: 30,
            scheduler: Scheduler.get(),
          })
          .pipe(take(1))
          .toPromise();
        expect(action).toEqual(
          (
            actions as unknown as ƟFilterEntitiesActions<TodoFilter>
          ).storeEntitiesFilter({
            filters: { content: 'x' },
          })
        );
      });

      it('should fire a debounced storeFilter action after filter action is fired', () => {
        const { effects, actions, mockStore, selectors } =
          initWithRemoteFilter();
        mockStore.overrideSelector(selectors.selectEntitiesFilter, {});
        actions$ = hot('a-b', {
          a: actions.filterEntities({ filters: { content: 'x' } }),
          b: actions.filterEntities({ filters: { content: 'y' } }),
        });
        const expected = hot('-----b', {
          b: (
            actions as unknown as ƟFilterEntitiesActions<TodoFilter>
          ).storeEntitiesFilter({
            filters: { content: 'y' },
          }),
        });
        expect(
          effects.storeFilter$({
            debounce: 30,
            scheduler: Scheduler.get(),
          })
        ).toBeObservable(expected);
      });

      it('should not fire  storeFilter action after filter if payload is the same as before', () => {
        const { effects, actions, mockStore, selectors } =
          initWithRemoteFilter();
        mockStore.overrideSelector(selectors.selectEntitiesFilter, {});
        actions$ = hot('a----a', {
          a: actions.filterEntities({ filters: { content: 'x' } }),
        });
        const expected = hot('---a', {
          a: (
            actions as unknown as ƟFilterEntitiesActions<TodoFilter>
          ).storeEntitiesFilter({
            filters: { content: 'x' },
          }),
        });
        expect(
          effects.storeFilter$({
            debounce: 30,
            scheduler: Scheduler.get(),
          })
        ).toBeObservable(expected);
      });

      it.todo(
        'should merge current filters with passed filters when patch is true'
      );
    });
  });
});
