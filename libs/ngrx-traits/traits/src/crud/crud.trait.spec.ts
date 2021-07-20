import { TestBed } from '@angular/core/testing';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { ChangeType, CrudState } from '../crud/crud.model';
import { addCrudEntities } from '../crud/crud.trait';
import { addFilter, FilterState } from '../filter';
import { addLoadEntities, EntityAndStatusState } from '../load-entities';
import { Todo, TodoFilter } from '../load-entities/load-entities.trait.spec';
import { addPagination, PaginationState } from '../pagination';
import { addSort, SortState } from '../sort';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { createFeatureSelector } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';

describe('addCrud trait', () => {
  let actions$: Actions;
  const featureSelector = createFeatureSelector<TestState>('test');
  const featureSelector2 = createFeatureSelector<TestState2>('test');

  interface TestState extends EntityAndStatusState<Todo>, CrudState<Todo> {}

  interface TestState2
    extends EntityAndStatusState<Todo>,
      CrudState<Todo>,
      FilterState<TodoFilter>,
      PaginationState,
      SortState<Todo> {}

  function init({ storeChanges = false } = {}) {
    const traits = createEntityFeatureFactory(
      addLoadEntities<Todo>(),
      addCrudEntities<Todo>({ storeChanges })
    )({
      actionsGroupKey: 'test',
      featureSelector: featureSelector,
    });

    TestBed.configureTestingModule({
      providers: [provideMockStore(), provideMockActions(() => actions$)],
    });
    return { ...traits };
  }

  function initPaginatedWithFilteringAndSorting() {
    const traits = createEntityFeatureFactory(
      addPagination({ cacheType: 'partial' }),
      addFilter<Todo, TodoFilter>(),
      addSort<Todo>({
        defaultSort: { direction: 'asc', active: 'id' },
        remote: true,
      }),
      addLoadEntities<Todo>(),
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
    return { ...traits, effects: TestBed.inject(traits.effects[0]) };
  }
  describe('selectors', () => {
    function initWithTestState() {
      const { selectors, initialState } = init();
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
        changes: [
          { id: 1, changeType: ChangeType.CREATED },
          { id: 1, changeType: ChangeType.UPDATED },
          { id: 1, changeType: ChangeType.DELETED },
          { id: 2, changeType: ChangeType.CREATED },
          { id: 3, changeType: ChangeType.DELETED },
          { id: 4, changeType: ChangeType.CREATED },
          { id: 4, changeType: ChangeType.UPDATED },
          { id: 5, changeType: ChangeType.UPDATED },
          { id: 5, changeType: ChangeType.DELETED },
          { id: 7, changeType: ChangeType.UPDATED },
        ],
      };
      return { state, selectors, initialState };
    }

    it('selectFilteredChanges should filter unnecessary changes ', () => {
      /**
       * if you add and remove the same and items this changes are remove from the list
       * if you add and then update one or more time, the updates are discarded
       * if you update one or more time and then remove, the updates are discarded
       */
      const { selectors, state } = initWithTestState();
      expect(selectors.selectFilteredChanges.projector(state)).toEqual([
        { id: 2, changeType: ChangeType.CREATED },
        { id: 3, changeType: ChangeType.DELETED },
        { id: 4, changeType: ChangeType.CREATED },
        { id: 5, changeType: ChangeType.DELETED },
        { id: 7, changeType: ChangeType.UPDATED },
      ]);
    });

    it('selectAllFilteredChanges should filter unnecessary changes and has entities added in result ', () => {
      const { selectors, state } = initWithTestState();
      expect(selectors.selectAllFilteredChanges.projector(state)).toEqual([
        {
          entity: state.entities[2],
          changeType: ChangeType.CREATED,
        },
        {
          entity: state.entities[3],
          changeType: ChangeType.DELETED,
        },
        {
          entity: state.entities[4],
          changeType: ChangeType.CREATED,
        },
        {
          entity: state.entities[5],
          changeType: ChangeType.DELETED,
        },
        {
          entity: state.entities[7],
          changeType: ChangeType.UPDATED,
        },
      ]);
    });

    it('selectChanges should return changes ', () => {
      const { selectors, state } = initWithTestState();
      expect(selectors.selectChanges.projector(state)).toEqual(state.changes);
    });

    it('selectChanges should filter unnecessary changes ', () => {
      const { selectors, state } = initWithTestState();
      expect(
        selectors.selectAllChanges.projector(state, {
          type: ChangeType.CREATED,
        })
      ).toEqual([
        { entity: state.entities[1], changeType: ChangeType.CREATED },
        { entity: state.entities[2], changeType: ChangeType.CREATED },
        { entity: state.entities[4], changeType: ChangeType.CREATED },
      ]);

      expect(
        selectors.selectAllChanges.projector(state, {
          type: ChangeType.UPDATED,
        })
      ).toEqual([
        { entity: state.entities[1], changeType: ChangeType.UPDATED },
        { entity: state.entities[4], changeType: ChangeType.UPDATED },
        { entity: state.entities[5], changeType: ChangeType.UPDATED },
        { entity: state.entities[7], changeType: ChangeType.UPDATED },
      ]);

      expect(
        selectors.selectAllChanges.projector(state, {
          type: ChangeType.DELETED,
        })
      ).toEqual([
        { entity: state.entities[1], changeType: ChangeType.DELETED },
        { entity: state.entities[3], changeType: ChangeType.DELETED },
        { entity: state.entities[5], changeType: ChangeType.DELETED },
      ]);
    });
  });
  describe('reducer', () => {
    it('add single entities', () => {
      const { reducer, actions, initialState } = init();
      const state = reducer(
        initialState,
        actions.add({ id: 1, content: 'one' })
      );
      expect(state.entities).toEqual({ 1: { id: 1, content: 'one' } });
      expect(state.changes).toEqual([
        { id: 1, changeType: ChangeType.CREATED },
      ]);
    });

    it('add multiple entities', () => {
      const { reducer, actions, initialState } = init();
      const state = reducer(
        initialState,
        actions.add({ id: 1, content: 'one' }, { id: 2, content: 'two' })
      );
      expect(state.entities).toEqual({
        1: { id: 1, content: 'one' },
        2: { id: 2, content: 'two' },
      });
      expect(state.changes).toEqual([
        { id: 1, changeType: ChangeType.CREATED },
        { id: 2, changeType: ChangeType.CREATED },
      ]);
    });

    it('add entity with storeChanges', () => {
      const { reducer, actions, initialState } = init({
        storeChanges: true,
      });
      const state = reducer(
        initialState,
        actions.add({ id: 1, content: 'one' }, { id: 2, content: 'two' })
      );
      expect(state.entities).toEqual({
        1: { id: 1, content: 'one' },
        2: { id: 2, content: 'two' },
      });
      expect(state.changes).toEqual([
        {
          id: 1,
          changeType: ChangeType.CREATED,
          entityChanges: { id: 1, content: 'one' },
        },
        {
          id: 2,
          changeType: ChangeType.CREATED,
          entityChanges: { id: 2, content: 'two' },
        },
      ]);
    });

    describe('upsert', () => {
      it('should update existing entity', () => {
        const { reducer, actions, initialState } = init({
          storeChanges: true,
        });

        let state = reducer(
          initialState,
          actions.add({ id: 1, content: 'one' }, { id: 2, content: 'two' })
        );

        state = reducer(
          state,
          actions.upsert({ id: 1, content: 'one-updated' })
        );

        expect(state.changes).toEqual([
          {
            id: 1,
            changeType: ChangeType.CREATED,
            entityChanges: { id: 1, content: 'one' },
          },
          {
            id: 2,
            changeType: ChangeType.CREATED,
            entityChanges: { id: 2, content: 'two' },
          },

          {
            id: 1,
            changeType: ChangeType.UPDATED,
            entityChanges: { id: 1, content: 'one-updated' },
          },
        ]);

        expect(state.entities).toEqual({
          1: { id: 1, content: 'one-updated' },
          2: { id: 2, content: 'two' },
        });
      });

      it('should create new entity', () => {
        const { reducer, actions, initialState } = init({
          storeChanges: true,
        });

        let state = reducer(
          initialState,
          actions.add({ id: 1, content: 'one' }, { id: 2, content: 'two' })
        );

        state = reducer(state, actions.upsert({ id: 3, content: 'new' }));

        expect(state.changes).toEqual([
          {
            id: 1,
            changeType: ChangeType.CREATED,
            entityChanges: { id: 1, content: 'one' },
          },
          {
            id: 2,
            changeType: ChangeType.CREATED,
            entityChanges: { id: 2, content: 'two' },
          },
          {
            id: 3,
            changeType: ChangeType.CREATED,
            entityChanges: { id: 3, content: 'new' },
          },
        ]);

        expect(state.entities).toEqual({
          1: { id: 1, content: 'one' },
          2: { id: 2, content: 'two' },
          3: { id: 3, content: 'new' },
        });
      });

      it('should update and create entities', () => {
        const { reducer, actions, initialState } = init({
          storeChanges: true,
        });

        let state = reducer(
          initialState,
          actions.add({ id: 1, content: 'one' }, { id: 2, content: 'two' })
        );

        state = reducer(
          state,
          actions.upsert(
            { id: 1, content: 'one-updated' },
            { id: 3, content: 'new' }
          )
        );

        expect(state.changes).toEqual([
          {
            id: 1,
            changeType: ChangeType.CREATED,
            entityChanges: { id: 1, content: 'one' },
          },
          {
            id: 2,
            changeType: ChangeType.CREATED,
            entityChanges: { id: 2, content: 'two' },
          },
          {
            id: 3,
            changeType: ChangeType.CREATED,
            entityChanges: { id: 3, content: 'new' },
          },
          {
            id: 1,
            changeType: ChangeType.UPDATED,
            entityChanges: { id: 1, content: 'one-updated' },
          },
        ]);

        expect(state.entities).toEqual({
          1: { id: 1, content: 'one-updated' },
          2: { id: 2, content: 'two' },
          3: { id: 3, content: 'new' },
        });
      });
    });

    it('remove single entity', () => {
      const { reducer, actions, initialState } = init();
      let state = reducer(initialState, actions.add({ id: 1, content: 'one' }));
      state = reducer(state, actions.remove(1));
      expect(state.entities).toEqual({});
      expect(state.changes).toEqual([
        { id: 1, changeType: ChangeType.CREATED },
        { id: 1, changeType: ChangeType.DELETED },
      ]);
    });

    it('remove multiple entities', () => {
      const { reducer, actions, initialState } = init();
      let state = reducer(
        initialState,
        actions.add({ id: 1, content: 'one' }, { id: 2, content: 'two' })
      );
      state = reducer(state, actions.remove(1, 2));
      expect(state.entities).toEqual({});
      expect(state.changes).toEqual([
        { id: 1, changeType: ChangeType.CREATED },
        { id: 2, changeType: ChangeType.CREATED },
        { id: 1, changeType: ChangeType.DELETED },
        { id: 2, changeType: ChangeType.DELETED },
      ]);
    });

    it('remove all', () => {
      const { reducer, actions, initialState } = init();
      let state = reducer(
        initialState,
        actions.add({ id: 1, content: 'one' }, { id: 2, content: 'two' })
      );
      state = reducer(state, actions.removeAll());
      expect(state.entities).toEqual({});
      expect(state.changes).toEqual([
        { id: 1, changeType: ChangeType.CREATED },
        { id: 2, changeType: ChangeType.CREATED },
        { id: 1, changeType: ChangeType.DELETED },
        { id: 2, changeType: ChangeType.DELETED },
      ]);
    });

    it('update single entity', () => {
      const { reducer, actions, initialState } = init();
      let state = reducer(initialState, actions.add({ id: 1, content: 'one' }));
      state = reducer(
        state,
        actions.update({ id: 1, changes: { content: 'uno' } })
      );
      expect(state.entities).toEqual({ 1: { id: 1, content: 'uno' } });
      expect(state.changes).toEqual([
        { id: 1, changeType: ChangeType.CREATED },
        { id: 1, changeType: ChangeType.UPDATED },
      ]);
    });

    it('update multiple entities', () => {
      const { reducer, actions, initialState } = init();
      let state = reducer(
        initialState,
        actions.add({ id: 1, content: 'one' }, { id: 2, content: 'two' })
      );
      state = reducer(
        state,
        actions.update(
          { id: 1, changes: { content: 'uno' } },
          { id: 2, changes: { content: 'dos' } }
        )
      );
      expect(state.entities).toEqual({
        1: { id: 1, content: 'uno' },
        2: { id: 2, content: 'dos' },
      });
      expect(state.changes).toEqual([
        { id: 1, changeType: ChangeType.CREATED },
        { id: 2, changeType: ChangeType.CREATED },
        { id: 1, changeType: ChangeType.UPDATED },
        { id: 2, changeType: ChangeType.UPDATED },
      ]);
    });

    it('update single entity with storeChanges', () => {
      const { reducer, actions, initialState } = init({
        storeChanges: true,
      });
      let state = reducer(initialState, actions.add({ id: 1, content: 'one' }));
      state = reducer(
        state,
        actions.update({ id: 1, changes: { content: 'uno' } })
      );
      expect(state.entities).toEqual({ 1: { id: 1, content: 'uno' } });
      expect(state.changes).toEqual([
        {
          id: 1,
          changeType: ChangeType.CREATED,
          entityChanges: { id: 1, content: 'one' },
        },
        {
          id: 1,
          changeType: ChangeType.UPDATED,
          entityChanges: { content: 'uno' },
        },
      ]);
    });

    it('update single entity changing id', () => {
      const { reducer, actions, initialState } = init();
      let state = reducer(initialState, actions.add({ id: 1, content: 'one' }));
      state = reducer(
        state,
        actions.update({ id: 1, changes: { id: 2, content: 'dos' } })
      );
      expect(state.entities).toEqual({ 2: { id: 2, content: 'dos' } });
      expect(state.changes).toEqual([
        { id: 2, changeType: ChangeType.CREATED },
        { id: 2, changeType: ChangeType.UPDATED },
      ]);
    });

    it('clearChanges', async () => {
      const { actions, reducer, initialState } = init();
      let result = reducer(
        initialState,
        actions.add({ id: 1, content: 'one' })
      );
      result = reducer(result, actions.clearChanges());
      expect(result.changes).toEqual([]);
    });

    it('if no pagination fetchSuccess should also clear changes', async () => {
      const { actions, reducer, initialState } = init();
      let result = reducer(
        initialState,
        actions.add({ id: 1, content: 'one' })
      );
      result = reducer(
        result,
        actions.fetchSuccess({ entities: [{ id: 1, content: 'one' }] })
      );
      expect(result.changes).toEqual([]);
    });

    it('if remote filter should also clear changes', async () => {
      const { actions, reducer, initialState } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(
        initialState,
        actions.add({ id: 1, content: 'one' })
      );
      result = reducer(result, actions.filter({ filters: { content: '1' } }));
      expect(result.changes).toEqual([]);
    });

    it('if remote sort should also clear changes', async () => {
      const { actions, reducer, initialState } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(
        initialState,
        actions.add({ id: 1, content: 'one' })
      );
      result = reducer(
        result,
        actions.sort({ active: 'id', direction: 'desc' })
      );
      expect(result.changes).toEqual([]);
    });

    it('if partial pagination should also clear changes', async () => {
      const { actions, reducer, initialState } =
        initPaginatedWithFilteringAndSorting();
      let result = reducer(
        initialState,
        actions.add({ id: 1, content: 'one' })
      );
      result = reducer(result, actions.loadPageSuccess());
      expect(result.changes).toEqual([]);
    });
  });
});
