import { TestBed } from '@angular/core/testing';
import { createEntityFeatureFactory } from '@ngrx-traits/core';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { createAction, createFeatureSelector } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { first } from 'rxjs/operators';

import {
  addEntitiesPaginationTrait,
  EntitiesPaginationState,
} from '../entities-pagination';
import { FilterEntitiesState } from '../filter-entities';
import { addFilterEntitiesTrait } from '../filter-entities/filter-entities.trait';
import { addLoadEntitiesTrait, LoadEntitiesState } from '../load-entities';
import { Todo, TodoFilter } from '../load-entities/load-entities.trait.spec';
import { addResetEntitiesStateTrait } from './reset.trait';

export interface TestState
  extends LoadEntitiesState<Todo>,
    EntitiesPaginationState,
    FilterEntitiesState<TodoFilter> {}

describe('addReset Trait', () => {
  let actions$: Actions;
  const featureSelector = createFeatureSelector<TestState>('test');
  const globalReset = createAction('Global reset');

  function initWithRemoteFilterWithPagination() {
    const traits = createEntityFeatureFactory(
      { entityName: 'product', entitiesName: 'products' },
      addLoadEntitiesTrait<Todo>(),
      addFilterEntitiesTrait<Todo, TodoFilter>(),
      addEntitiesPaginationTrait<Todo>(),
      addResetEntitiesStateTrait({
        resetOn: [globalReset],
      }),
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector,
    });
    TestBed.configureTestingModule({
      providers: [
        traits.effects[1],
        provideMockActions(() => actions$!),
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
        actions.loadProductsSuccess({ entities: [] }),
      );
      result = reducer(result, actions.resetProductsState());
      expect(result).toEqual(initialState);
    });
    it('reset with globalReset should return initialState', async () => {
      const { actions, reducer, initialState } =
        initWithRemoteFilterWithPagination();
      let result = reducer(
        initialState,
        actions.loadProductsSuccess({ entities: [] }),
      );
      result = reducer(result, globalReset());
      expect(result).toEqual(initialState);
    });
  });
});
