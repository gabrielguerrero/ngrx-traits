import { Actions } from '@ngrx/effects';
import { createFeatureSelector } from '@ngrx/store';
import { TestBed } from '@angular/core/testing';
import { Todo, TodoFilter } from '../load-entities/load-entities.trait.spec';
import {
  addEntitiesPaginationTrait,
  EntitiesPaginationState,
} from '../entities-pagination';
import { addSortEntitiesTrait, SortEntitiesState } from '../sort-entities';
import { addLoadEntitiesTrait, LoadEntitiesState } from '../load-entities';
import { addCrudEntitiesTrait, CrudEntitiesState } from '../crud-entities';
import {
  addFilterEntitiesTrait,
  FilterEntitiesState,
} from '../filter-entities';
import { SelectEntitiesState } from './select-entities.model';
import { createEntityFeatureFactory } from '@ngrx-traits/core';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { toMap } from '@ngrx-traits/core';
import { addSelectEntitiesTrait } from './select-entities.trait';

describe('addSelectEntities trait', () => {
  let actions$: Actions;
  const featureSelector = createFeatureSelector<TestState>('test');
  const featureSelector2 = createFeatureSelector<TestState2>('test');

  interface TestState extends LoadEntitiesState<Todo>, SelectEntitiesState {}

  interface TestState2
    extends LoadEntitiesState<Todo>,
      SelectEntitiesState,
      FilterEntitiesState<TodoFilter>,
      EntitiesPaginationState,
      SortEntitiesState<Todo>,
      CrudEntitiesState<Todo> {}

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

  function init() {
    const traits = createEntityFeatureFactory(
      { entityName: 'entity', entitiesName: 'entities' },
      addLoadEntitiesTrait<Todo>(),
      addSelectEntitiesTrait<Todo>()
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector,
    });

    TestBed.configureTestingModule({
      providers: [provideMockStore(), provideMockActions(() => actions$)],
    });

    const initialState = traits.initialState;
    const state = getTestState(initialState);
    return {
      ...traits,
      state,
      reducer: traits.reducer,
      actions: traits.actions,
      selectors: traits.selectors,
    };
  }

  function initPaginatedWithFilteringAndSorting() {
    const traits = createEntityFeatureFactory(
      { entityName: 'entity', entitiesName: 'entities' },
      addLoadEntitiesTrait<Todo>(),
      addEntitiesPaginationTrait({ cacheType: 'partial' }),
      addFilterEntitiesTrait<Todo, TodoFilter>(),
      addSortEntitiesTrait<Todo>({
        defaultSort: { direction: 'asc', active: 'id' },
        remote: true,
      }),
      addSelectEntitiesTrait<Todo>(),
      addCrudEntitiesTrait<Todo>()
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector2,
    });

    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        traits.effects[0],
        provideMockActions(() => actions$),
      ],
    });

    const initialState = traits.initialState;
    const state = getTestState(initialState) as TestState2;
    return {
      ...traits,
      effects: TestBed.inject(traits.effects[0]),
      state,
      reducer: traits.reducer,
      actions: traits.actions,
      selectors: traits.selectors,
    };
  }

  describe('selectors', () => {
    it('selectEntitiesIdsSelectedMap should return selected ids in a dictionary by id ', () => {
      const { selectors, state } = init();
      expect(selectors.selectEntitiesIdsSelectedMap.projector(state)).toEqual(
        {}
      );
      expect(
        selectors.selectEntitiesIdsSelectedMap.projector({
          ...state,
          selectedIds: { 3: true, 4: true, 7: true },
        })
      ).toEqual({ 3: true, 4: true, 7: true });
    });

    it('selectEntitiesIdsSelectedList should return selected ids in an array ', () => {
      const { selectors, state } = init();
      expect(selectors.selectEntitiesIdsSelectedList.projector(state)).toEqual(
        []
      );
      expect(
        selectors.selectEntitiesIdsSelectedList.projector({
          ...state,
          selectedIds: { 3: true, 4: true, 7: true },
        })
      ).toEqual(['3', '4', '7']);
    });

    it('selectEntitiesSelectedMap should return a dictionary of entities by id ', () => {
      const { selectors, state } = init();
      expect(selectors.selectEntitiesSelectedMap.projector(state)).toEqual({});
      expect(
        selectors.selectEntitiesSelectedMap.projector({
          ...state,
          selectedIds: { 3: true, 4: true, 7: true },
        })
      ).toEqual({
        3: { id: 3, content: '3' },
        4: { id: 4, content: '4' },
        7: { id: 7, content: '7' },
      });
    });

    it('selectEntitiesSelectedList should return all selected entities ', () => {
      const { selectors, state } = init();
      expect(selectors.selectEntitiesSelectedList.projector(state)).toEqual([]);
      expect(
        selectors.selectEntitiesSelectedList.projector({
          ...state,
          selectedIds: { 3: true, 4: true, 7: true },
        })
      ).toEqual([
        { id: 3, content: '3' },
        { id: 4, content: '4' },
        { id: 7, content: '7' },
      ]);
    });

    it('selectTotalSelectedEntities should return count of selected ids ', () => {
      const { selectors, state } = init();
      expect(
        selectors.selectTotalSelectedEntities.projector({
          ...state,
          selectedIds: { 3: true, 4: true, 7: true },
        })
      ).toEqual(3);
    });

    it('isAllEntitiesSelected should return all, none, some accordingly ', () => {
      const { selectors, state } = init();
      expect(
        selectors.isAllEntitiesSelected.projector({
          ...state,
        })
      ).toEqual('none');
      expect(
        selectors.isAllEntitiesSelected.projector({
          ...state,
          selectedIds: { 3: true, 4: true, 7: true },
        })
      ).toEqual('some');

      expect(
        selectors.isAllEntitiesSelected.projector({
          ...state,
          selectedIds: toMap(state.ids),
        })
      ).toEqual('all');
    });
  });

  describe('reducer', () => {
    it('selectEntities', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.selectEntities({ id: 3 }));
      result = reducer(result, actions.selectEntities({ id: 7 }));
      expect(result.selectedIds).toEqual({ 3: true, 7: true });
    });

    it('deselectEntities', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.selectEntities({ id: 3 }));
      result = reducer(result, actions.selectEntities({ id: 7 }));
      result = reducer(result, actions.deselectEntities({ id: 3 }));
      expect(result.selectedIds).toEqual({ 7: true });
    });

    it('toggleSelectEntity entity', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.toggleSelectEntities({ id: 3 }));
      result = reducer(result, actions.toggleSelectEntities({ id: 7 }));
      result = reducer(result, actions.toggleSelectEntities({ id: 3 }));
      expect(result.selectedIds).toEqual({ 7: true });
    });

    it('toggleSelectAllEntities', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.toggleSelectAllEntities());
      expect(result.selectedIds).toEqual(toMap(state.ids));
      result = reducer(result, actions.toggleSelectAllEntities());
      expect(result.selectedIds).toEqual({});
    });

    it('clearEntitiesSelection should deselectEntity all', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.selectEntities({ id: 3 }));
      result = reducer(result, actions.clearEntitiesSelection());
      expect(result.selectedIds).toEqual({});
    });

    it('loadEntitiesSuccess should deselectEntity also', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.selectEntities({ id: 3 }));
      result = reducer(
        result,
        actions.loadEntitiesSuccess({ entities: [{ id: 3, content: '3' }] })
      );
      expect(result.selectedIds).toEqual({});
    });

    it('remote filter should deselectEntity also', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.selectEntities({ id: 3 }));
      result = reducer(
        result,
        actions.filterEntities({ filters: { content: '2' } })
      );
      expect(result.selectedIds).toEqual({});
    });

    it('remote sort should deselectEntity also', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.selectEntities({ id: 3 }));
      result = reducer(
        result,
        actions.sortEntities({ active: 'id', direction: 'asc' })
      );
      expect(result.selectedIds).toEqual({});
    });

    it('pagination partial should deselectEntity also', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.selectEntities({ id: 3 }));
      result = reducer(result, actions.loadEntitiesPageSuccess());
      expect(result.selectedIds).toEqual({});
    });

    it('removeAll should deselectEntity also', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.selectEntities({ id: 3 }));
      result = reducer(result, actions.removeAllEntities());
      expect(result.selectedIds).toEqual({});
    });

    it('remove should deselectEntity only if the selectedId was removed', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.selectEntities({ id: 3 }));
      result = reducer(result, actions.removeEntities(2));
      expect(result.selectedIds).toEqual({ 3: true });
      result = reducer(result, actions.removeEntities(3));
      expect(result.selectedIds).toEqual({});
    });

    it('update that changes an id should change the selected id too', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.selectEntities({ id: 3 }));
      result = reducer(
        result,
        actions.updateEntities({ id: 3, changes: { id: 11, content: '11' } })
      );
      expect(result.selectedIds).toEqual({ 11: true });
    });
  });
});
