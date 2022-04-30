import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory } from '@ngrx-traits/core';
import { AsyncActionState } from './async-action.model';
import { addAsyncActionTrait } from './async-action.trait';

describe('addApiCall trait', () => {
  const featureSelector =
    createFeatureSelector<AsyncActionState<'createClient'>>('client');
  const featureSelector2 = createFeatureSelector<
    AsyncActionState<'createClient'> & AsyncActionState<'createProduct'>
  >('client');

  function init() {
    const traits = createEntityFeatureFactory(
      { entityName: 'entity', entitiesName: 'entities' },
      addAsyncActionTrait({
        name: 'createClient',
        actionProps: props<{ name: string }>(),
        actionSuccessProps: props<{ id: string }>(),
      })
    )({
      actionsGroupKey: 'Client',
      featureSelector,
    });
    return { ...traits };
  }

  function initMultiple() {
    const traits = createEntityFeatureFactory(
      { entityName: 'entity', entitiesName: 'entities' },
      addAsyncActionTrait({
        name: 'createClient',
        actionProps: props<{ name: string }>(),
      }),
      addAsyncActionTrait({
        name: 'createProduct',
        actionProps: props<{ name: string }>(),
        actionSuccessProps: props<{ id: string }>(),
      })
    )({
      actionsGroupKey: 'Client',
      featureSelector: featureSelector2,
    });

    return { ...traits };
  }

  describe('selectors', () => {
    it('isLoadingClientDetailsSelected should right value ', () => {
      const { selectors } = init();
      expect(
        selectors.isLoadingCreateClient.projector({
          createClientStatus: 'loading',
        })
      ).toEqual(true);
      expect(
        selectors.isLoadingCreateClient.projector({
          createClientStatus: 'success',
        })
      ).toEqual(false);
    });
    it('isSuccessClientDetailsSelected should return right value ', () => {
      const { selectors } = init();
      expect(
        selectors.isSuccessCreateClient.projector({
          createClientStatus: 'success',
        })
      ).toEqual(true);
      expect(
        selectors.isSuccessCreateClient.projector({
          createClientStatus: 'loading',
        })
      ).toEqual(false);
    });
    it('isFailClientDetailsSelected should return right value ', () => {
      const { selectors } = init();
      expect(
        selectors.isFailCreateClient.projector({
          createClientStatus: 'fail',
        })
      ).toEqual(true);
      expect(
        selectors.isFailCreateClient.projector({
          createClientStatus: 'loading',
        })
      ).toEqual(false);
    });
  });

  describe('reducer', () => {
    it('createClient should set status to loading ', () => {
      const { reducer, actions } = init();
      const state = reducer({}, actions.createClient({ name: 'Gabs' }));
      expect(state).toEqual({ createClientStatus: 'loading' });
    });
    it('createClientFailure should set status to fail ', () => {
      const { reducer, actions } = init();
      const state = reducer({}, actions.createClientFail());
      expect(state).toEqual({ createClientStatus: 'fail' });
    });
    it('createClientSuccess should set status to success and store the client', () => {
      const { reducer, actions } = init();
      const state = reducer(
        {},
        actions.createClientSuccess({
          id: '123',
        })
      );
      expect(state).toEqual({
        createClientStatus: 'success',
      });
    });
  });

  describe('Smoke test with multiple ApiCalls to ensure they dont conflict', () => {
    it('check actions are of different loadEntity are not conflicting', () => {
      const { reducer, actions, selectors } = initMultiple();
      let state = reducer(
        {},
        actions.createClient({
          name: 'Bob',
        })
      );
      state = reducer(
        state,
        actions.createProduct({
          name: 'Something',
        })
      );
      expect(selectors.isLoadingCreateClient.projector(state)).toEqual(true);
      expect(selectors.isLoadingCreateProduct.projector(state)).toEqual(true);
      state = reducer(state, actions.createClientSuccess());
      state = reducer(state, actions.createProductFail());
      expect(selectors.isSuccessCreateClient.projector(state)).toEqual(true);
      expect(selectors.isFailCreateProduct.projector(state)).toEqual(true);
    });
  });
});
