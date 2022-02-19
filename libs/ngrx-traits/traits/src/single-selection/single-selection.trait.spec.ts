import { TestBed } from '@angular/core/testing';
import { Todo, TodoFilter } from '../load-entities/load-entities.trait.spec';
import { addEntitiesPagination, EntitiesPaginationState } from '../pagination';
import { addSortEntities, SortEntitiesState } from '../sort';
import { createFeatureSelector } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { addLoadEntities, LoadEntitiesState } from '../load-entities';
import { addCrudEntities, CrudEntitiesState } from '../crud';
import { addFilterEntities, FilterEntitiesState } from '../filter';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { SelectEntityState } from './single-selection.model';
import { addSelectEntity } from './single-selection.trait';

describe('addSelectEntity trait', () => {
  let actions$: Actions;
  const featureSelector = createFeatureSelector<TestState>('test');
  const featureSelector2 = createFeatureSelector<TestState2>('test');

  interface TestState extends LoadEntitiesState<Todo>, SelectEntityState {}

  interface TestState2
    extends LoadEntitiesState<Todo>,
      SelectEntityState,
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
      addLoadEntities<Todo>(),
      addSelectEntity<Todo>()
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
      addEntitiesPagination({ cacheType: 'partial' }),
      addFilterEntities<Todo, TodoFilter>(),
      addSortEntities<Todo>({
        defaultSort: { direction: 'asc', active: 'id' },
        remote: true,
      }),
      addLoadEntities<Todo>(),
      addSelectEntity<Todo>(),
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
