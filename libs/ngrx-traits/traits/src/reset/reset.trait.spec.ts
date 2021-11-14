import { createAction, createFeatureSelector } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { addLoadEntities, LoadEntitiesState } from '../load-entities';
import { addFilter } from '../filter/filter.trait';
import { Todo, TodoFilter } from '../load-entities/load-entities.trait.spec';
import { Actions } from '@ngrx/effects';
import { of } from 'rxjs';
import { first } from 'rxjs/operators';
import { addPagination, PaginationState } from '../pagination';
import { provideMockActions } from '@ngrx/effects/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { FilterState } from '../filter';
import { addReset } from './reset.trait';

export interface TestState
  extends LoadEntitiesState<Todo>,
    PaginationState,
    FilterState<TodoFilter> {}

describe('addReset Trait', () => {
  let actions$: Actions;
  const featureSelector = createFeatureSelector<TestState>('test');
  const globalReset = createAction('Global reset');

  function initWithRemoteFilterWithPagination() {
    const traits = createEntityFeatureFactory(
      addLoadEntities<Todo>(),
      addFilter<Todo, TodoFilter>(),
      addPagination<Todo>(),
      addReset({
        resetOn: [globalReset],
      })
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

  describe('reducer', () => {
    it('reset should return initialState', async () => {
      const { actions, reducer, initialState } =
        initWithRemoteFilterWithPagination();
      let result = reducer(
        initialState,
        actions.loadEntitiesSuccess({ entities: [] })
      );
      result = reducer(result, actions.reset());
      expect(result).toEqual(initialState);
    });
  });

  describe('effects', () => {
    describe('externalReset$', () => {
      it('should fire reset if globalReset was fired', async () => {
        const { effects, actions } = initWithRemoteFilterWithPagination();
        actions$ = of(globalReset());
        const action = await effects.externalReset$.pipe(first()).toPromise();
        expect(action).toEqual(actions.reset());
      });
    });
  });
});
