import { Actions } from '@ngrx/effects';
import { createFeatureSelector } from '@ngrx/store';
import { TestBed } from '@angular/core/testing';
import { Todo, TodoFilter } from '../load-entities/load-entities.trait.spec';
import { addPagination, PaginationState } from '../pagination';
import { addSort, SortState } from '../sort';
import { addLoadEntities, LoadEntitiesState } from '../load-entities';
import { addCrudEntities, CrudState } from '../crud';
import { addFilter, FilterState } from '../filter';
import { MultipleSelectionState } from './multi-selection.model';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { toMap } from 'ngrx-traits';
import { addMultiSelection } from './multi-selection.trait';

describe('addMultiSelection trait', () => {
  let actions$: Actions;
  const featureSelector = createFeatureSelector<TestState>('test');
  const featureSelector2 = createFeatureSelector<TestState2>('test');

  interface TestState extends LoadEntitiesState<Todo>, MultipleSelectionState {}

  interface TestState2
    extends LoadEntitiesState<Todo>,
      MultipleSelectionState,
      FilterState<TodoFilter>,
      PaginationState,
      SortState<Todo>,
      CrudState<Todo> {}

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
      addLoadEntities<Todo>(),
      addMultiSelection<Todo>()
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
      addLoadEntities<Todo>(),
      addPagination({ cacheType: 'partial' }),
      addFilter<Todo, TodoFilter>(),
      addSort<Todo>({
        defaultSort: { direction: 'asc', active: 'id' },
        remote: true,
      }),
      addMultiSelection<Todo>(),
      addCrudEntities<Todo>()
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
    it('selectIdSelected should return selected ids in a dictionary by id ', () => {
      const { selectors, state } = init();
      expect(selectors.selectIdsSelected.projector(state)).toEqual({});
      expect(
        selectors.selectIdsSelected.projector({
          ...state,
          selectedIds: { 3: true, 4: true, 7: true },
        })
      ).toEqual({ 3: true, 4: true, 7: true });
    });

    it('selectAllIdsSelected should return selected ids in an array ', () => {
      const { selectors, state } = init();
      expect(selectors.selectAllIdsSelected.projector(state)).toEqual([]);
      expect(
        selectors.selectAllIdsSelected.projector({
          ...state,
          selectedIds: { 3: true, 4: true, 7: true },
        })
      ).toEqual(['3', '4', '7']);
    });

    it('selectEntitiesSelected should return a dictionary of entities by id ', () => {
      const { selectors, state } = init();
      expect(selectors.selectEntitiesSelected.projector(state)).toEqual({});
      expect(
        selectors.selectEntitiesSelected.projector({
          ...state,
          selectedIds: { 3: true, 4: true, 7: true },
        })
      ).toEqual({
        3: { id: 3, content: '3' },
        4: { id: 4, content: '4' },
        7: { id: 7, content: '7' },
      });
    });

    it('selectAllSelected should return all selected entities ', () => {
      const { selectors, state } = init();
      expect(selectors.selectAllSelected.projector(state)).toEqual([]);
      expect(
        selectors.selectAllSelected.projector({
          ...state,
          selectedIds: { 3: true, 4: true, 7: true },
        })
      ).toEqual([
        { id: 3, content: '3' },
        { id: 4, content: '4' },
        { id: 7, content: '7' },
      ]);
    });

    it('selectTotalSelected should return count of selected ids ', () => {
      const { selectors, state } = init();
      expect(
        selectors.selectTotalSelected.projector({
          ...state,
          selectedIds: { 3: true, 4: true, 7: true },
        })
      ).toEqual(3);
    });

    it('selectTotalSelected should return all, none, some accordingly ', () => {
      const { selectors, state } = init();
      expect(
        selectors.isAllSelected.projector({
          ...state,
        })
      ).toEqual('none');
      expect(
        selectors.isAllSelected.projector({
          ...state,
          selectedIds: { 3: true, 4: true, 7: true },
        })
      ).toEqual('some');

      expect(
        selectors.isAllSelected.projector({
          ...state,
          selectedIds: toMap(state.ids),
        })
      ).toEqual('all');
    });
  });

  describe('reducer', () => {
    it('select entity', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.multiSelect({ id: 3 }));
      result = reducer(result, actions.multiSelect({ id: 7 }));
      expect(result.selectedIds).toEqual({ 3: true, 7: true });
    });

    it('deselect entity', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.multiSelect({ id: 3 }));
      result = reducer(result, actions.multiSelect({ id: 7 }));
      result = reducer(result, actions.multiDeselect({ id: 3 }));
      expect(result.selectedIds).toEqual({ 7: true });
    });

    it('toggleSelect entity', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.multiToggleSelect({ id: 3 }));
      result = reducer(result, actions.multiToggleSelect({ id: 7 }));
      result = reducer(result, actions.multiToggleSelect({ id: 3 }));
      expect(result.selectedIds).toEqual({ 7: true });
    });

    it('toggleSelectAll', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.toggleSelectAll());
      expect(result.selectedIds).toEqual(toMap(state.ids));
      result = reducer(result, actions.toggleSelectAll());
      expect(result.selectedIds).toEqual({});
    });

    it('clearSelection should deselect all', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.multiSelect({ id: 3 }));
      result = reducer(result, actions.multiClearSelection());
      expect(result.selectedIds).toEqual({});
    });

    it('loadEntitiesSuccess should deselect also', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.multiSelect({ id: 3 }));
      result = reducer(
        result,
        actions.loadEntitiesSuccess({ entities: [{ id: 3, content: '3' }] })
      );
      expect(result.selectedIds).toEqual({});
    });

    it('remote filter should deselect also', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.multiSelect({ id: 3 }));
      result = reducer(result, actions.filter({ filters: { content: '2' } }));
      expect(result.selectedIds).toEqual({});
    });

    it('remote sort should deselect also', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.multiSelect({ id: 3 }));
      result = reducer(
        result,
        actions.sort({ active: 'id', direction: 'asc' })
      );
      expect(result.selectedIds).toEqual({});
    });

    it('pagination partial should deselect also', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.multiSelect({ id: 3 }));
      result = reducer(result, actions.loadPageSuccess());
      expect(result.selectedIds).toEqual({});
    });

    it('removeAll should deselect also', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.multiSelect({ id: 3 }));
      result = reducer(result, actions.removeAll());
      expect(result.selectedIds).toEqual({});
    });

    it('remove should deselect only if the selectedId was removed', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.multiSelect({ id: 3 }));
      result = reducer(result, actions.remove(2));
      expect(result.selectedIds).toEqual({ 3: true });
      result = reducer(result, actions.remove(3));
      expect(result.selectedIds).toEqual({});
    });

    it('update that changes an id should change the selected id too', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.multiSelect({ id: 3 }));
      result = reducer(
        result,
        actions.update({ id: 3, changes: { id: 11, content: '11' } })
      );
      expect(result.selectedIds).toEqual({ 11: true });
    });
  });
});
