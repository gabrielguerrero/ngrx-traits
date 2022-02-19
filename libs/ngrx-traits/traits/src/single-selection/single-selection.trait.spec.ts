import { TestBed } from '@angular/core/testing';
import { Todo, TodoFilter } from '../load-entities/load-entities.trait.spec';
import { addPagination, PaginationState } from '../pagination';
import { addSort, SortState } from '../sort';
import { createFeatureSelector } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { addLoadEntities, LoadEntitiesState } from '../load-entities';
import { addCrudEntities, CrudState } from '../crud';
import { addFilter, FilterState } from '../filter';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { SingleSelectionState } from './single-selection.model';
import { addSingleSelection } from './single-selection.trait';

describe('addSingleSelection trait', () => {
  let actions$: Actions;
  const featureSelector = createFeatureSelector<TestState>('test');
  const featureSelector2 = createFeatureSelector<TestState2>('test');

  interface TestState extends LoadEntitiesState<Todo>, SingleSelectionState {}

  interface TestState2
    extends LoadEntitiesState<Todo>,
      SingleSelectionState,
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
      { entityName: 'entity', entitiesName: 'entities' },
      addLoadEntities<Todo>(),
      addSingleSelection<Todo>()
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
      addPagination({ cacheType: 'partial' }),
      addFilter<Todo, TodoFilter>(),
      addSort<Todo>({
        defaultSort: { direction: 'asc', active: 'id' },
        remote: true,
      }),
      addLoadEntities<Todo>(),
      addSingleSelection<Todo>(),
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
    it('selectEntityIdSelected should return selected id ', () => {
      const { selectors, state } = init();
      expect(selectors.selectEntityIdSelected.projector(state)).toBeFalsy();
      expect(
        selectors.selectEntityIdSelected.projector({ ...state, selectedId: 3 })
      ).toEqual(3);
    });

    it('selectEntityIdSelected should return selected id ', () => {
      const { selectors, state } = init();
      expect(selectors.selectEntitySelected.projector(state)).toBeFalsy();
      expect(
        selectors.selectEntitySelected.projector({ ...state, selectedId: 3 })
      ).toEqual({ id: 3, content: '3' });
    });
  });

  describe('reducer', () => {
    it('select entity', () => {
      const { reducer, actions, state } = init();
      const result = reducer(state, actions.selectEntity({ id: 3 }));
      expect(result).toEqual({ ...state, selectedId: 3 });
    });

    it('deselect entity', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.selectEntity({ id: 3 }));
      result = reducer(result, actions.deselectEntity());
      expect(result).toEqual({ ...state, selectedId: undefined });
    });

    it('toggleSelectEntity entity', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.toggleSelectEntity({ id: 3 }));
      expect(result).toEqual({ ...state, selectedId: 3 });
      result = reducer(result, actions.toggleSelectEntity({ id: 3 }));
      expect(result).toEqual({ ...state, selectedId: undefined });
    });

    it('loadEntitiesSuccess should deselect also', () => {
      const { reducer, actions, state } = init();
      let result = reducer(state, actions.selectEntity({ id: 3 }));
      result = reducer(
        result,
        actions.loadEntitiesSuccess({ entities: [{ id: 3, content: '3' }] })
      );
      expect(result.selectedId).toEqual(undefined);
    });

    it('remote filter should deselect also', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.selectEntity({ id: 3 }));
      result = reducer(
        result,
        actions.filterEntities({ filters: { content: '2' } })
      );
      expect(result.selectedId).toEqual(undefined);
    });

    it('remote sort should deselect also', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.selectEntity({ id: 3 }));
      result = reducer(
        result,
        actions.sortEntities({ active: 'id', direction: 'asc' })
      );
      expect(result.selectedId).toEqual(undefined);
    });

    it('pagination partial should deselect also', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.selectEntity({ id: 3 }));
      result = reducer(result, actions.loadEntitiesPageSuccess());
      expect(result.selectedId).toEqual(undefined);
    });

    it('removeAll should deselect also', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.selectEntity({ id: 3 }));
      result = reducer(result, actions.removeAllEntities());
      expect(result.selectedId).toEqual(undefined);
    });

    it('remove should deselect only if the selectedId was removed', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.selectEntity({ id: 3 }));
      result = reducer(result, actions.removeEntities(2));
      expect(result.selectedId).toEqual(3);
      result = reducer(result, actions.removeEntities(3));
      expect(result.selectedId).toEqual(undefined);
    });

    it('update that changes an id should change the selected id too', () => {
      const { reducer, actions, state } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(state, actions.selectEntity({ id: 3 }));
      result = reducer(
        result,
        actions.updateEntities({ id: 3, changes: { id: 11, content: '11' } })
      );
      expect(result.selectedId).toEqual(11);
    });
  });
});
