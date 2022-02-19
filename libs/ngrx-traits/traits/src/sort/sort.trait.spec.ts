import { Actions } from '@ngrx/effects';
import { createFeatureSelector } from '@ngrx/store';
import { of } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { TestBed } from '@angular/core/testing';
import { Todo, TodoFilter } from '../load-entities/load-entities.trait.spec';
import { addEntitiesPagination, EntitiesPaginationState } from '../pagination';
import { SortEntitiesState } from './sort.model';
import { addLoadEntities, LoadEntitiesState } from '../load-entities';
import { addFilterEntities, FilterEntitiesState } from '../filter';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { SelectEntityState } from '../single-selection';
import { addSortEntities } from './sort.trait';

describe('addSortEntities trait', () => {
  let actions$: Actions;
  const featureSelector = createFeatureSelector<TestState>('test');
  const featureSelector2 = createFeatureSelector<TestState2>('test');

  interface TestState
    extends LoadEntitiesState<Todo>,
      SelectEntityState,
      SortEntitiesState<Todo> {}

  interface TestState2
    extends LoadEntitiesState<Todo>,
      FilterEntitiesState<TodoFilter>,
      EntitiesPaginationState,
      SortEntitiesState<Todo> {}

  function getTestState(initialState: TestState) {
    const state: TestState = {
      ...initialState,
      ids: [1, 2, 3, 4, 5, 6, 7],
      entities: {
        1: { id: 1, content: '1' },
        2: { id: 2, content: '2' },
        3: { id: 3, content: '3' },
        4: { id: 4, content: '4' },
        5: { id: 5, content: '5' },
        6: { id: 6, content: '6' },
        7: { id: 7, content: '7' },
      },
    };
    return state;
  }

  function init({ remoteSort = false } = {}) {
    const traits = createEntityFeatureFactory(
      { entityName: 'entity', entitiesName: 'entities' },
      addLoadEntities<Todo>(),
      addSortEntities<Todo>({
        defaultSort: { active: 'id', direction: 'asc' },
        remote: remoteSort,
      })
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector,
    });

    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        traits.effects[0] ? traits.effects[0] : [],
        provideMockActions(() => actions$),
      ],
    });
    const initialState = traits.initialState;
    const state = getTestState(initialState);
    return {
      ...traits,
      effects: traits.effects[0] && TestBed.inject(traits.effects[0]),
      state,
      reducer: traits.reducer,
      actions: traits.actions,
      selectors: traits.selectors,
    };
  }

  function initPaginatedWithFilteringAndSorting() {
    const traits = createEntityFeatureFactory(
      { entityName: 'entity', entitiesName: 'entities' },
      addEntitiesPagination({ cacheType: 'partial' }),
      addFilterEntities<Todo, TodoFilter>(),
      addSortEntities<Todo>({
        defaultSort: { direction: 'asc', active: 'id' },
        remote: true,
      }),
      addLoadEntities<Todo>()
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector2,
    });

    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        traits.effects[2],
        provideMockActions(() => actions$),
      ],
    });

    const initialState = traits.initialState;
    const state = getTestState(initialState) as TestState2;
    return {
      ...traits,
      effects: TestBed.inject(traits.effects[2]),
      state,
      reducer: traits.reducer,
      actions: traits.actions,
      selectors: traits.selectors,
    };
  }

  describe('selectors', () => {
    it('selectSort should return selected sort ', () => {
      const { selectors, state } = init();
      expect(selectors.selectEntitiesSort.projector(state)).toEqual({
        active: 'id',
        direction: 'asc',
      });
      expect(
        selectors.selectEntitiesSort.projector({
          ...state,
          sort: {
            current: { active: 'id', direction: 'asc' },
            default: { active: 'content', direction: 'asc' },
          },
        })
      ).toEqual({ active: 'id', direction: 'asc' });
    });
  });

  describe('reducer', () => {
    it('sort entities', () => {
      const { reducer, actions, state } = init();
      let result = reducer(
        state,
        actions.sortEntities({ direction: 'asc', active: 'id' })
      );
      expect(result.ids).toEqual([1, 2, 3, 4, 5, 6, 7]);

      result = reducer(
        state,
        actions.sortEntities({ direction: 'desc', active: 'id' })
      );
      expect(result.ids).toEqual([1, 2, 3, 4, 5, 6, 7].reverse());

      result = reducer(
        state,
        actions.sortEntities({ direction: 'asc', active: 'content' })
      );
      expect(result.ids).toEqual([1, 2, 3, 4, 5, 6, 7]);

      result = reducer(
        state,
        actions.sortEntities({ direction: 'desc', active: 'content' })
      );
      expect(result.ids).toEqual([1, 2, 3, 4, 5, 6, 7].reverse());
    });

    it('resetEntitiesSort entities', () => {
      const { reducer, actions, state } = init();
      let result = reducer(
        {
          ...state,
          sort: {
            default: { direction: 'desc', active: 'id' },
            current: { active: 'content', direction: 'asc' },
          },
        },
        actions.sortEntities({ direction: 'asc', active: 'id' })
      );

      result = reducer(result, actions.resetEntitiesSort());
      expect(result.ids).toEqual([1, 2, 3, 4, 5, 6, 7].reverse());
    });

    describe('effects', () => {
      it('when paginated should fire loadEntitiesFirstPage if sort was fired ', async () => {
        const { effects, actions } = initPaginatedWithFilteringAndSorting();
        actions$ = of(actions.sortEntities({ active: 'id', direction: 'asc' }));
        const action = await effects.remoteSort$
          .pipe(take(2), toArray())
          .toPromise();
        expect(action).toEqual([
          actions.clearEntitiesPagesCache(),
          actions.loadEntitiesFirstPage(),
        ]);
      });

      it('when paginated should fire loadEntitiesFirstPage if resetEntitiesSort was fired ', async () => {
        const { effects, actions } = initPaginatedWithFilteringAndSorting();
        actions$ = of(actions.resetEntitiesSort());
        const action = await effects.remoteSort$
          .pipe(take(2), toArray())
          .toPromise();
        expect(action).toEqual([
          actions.clearEntitiesPagesCache(),
          actions.loadEntitiesFirstPage(),
        ]);
      });

      it('should fire loadEntitiesFirstPage if sort was fired ', async () => {
        const { effects, actions } = init({ remoteSort: true });
        actions$ = of(actions.sortEntities({ active: 'id', direction: 'asc' }));
        const action = await effects.remoteSort$.pipe(take(1)).toPromise();
        expect(action).toEqual(actions.loadEntities());
      });

      it('should fire loadEntitiesFirstPage if resetEntitiesSort was fired ', async () => {
        const { effects, actions } = init({ remoteSort: true });
        actions$ = of(actions.resetEntitiesSort());
        const action = await effects.remoteSort$.pipe(take(1)).toPromise();
        expect(action).toEqual(actions.loadEntities());
      });
    });
  });
});
