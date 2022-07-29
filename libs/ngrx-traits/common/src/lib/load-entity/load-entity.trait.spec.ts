import { Actions } from '@ngrx/effects';
import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory } from '@ngrx-traits/core';
import { LoadEntityState } from './load-entity.model';
import { addLoadEntityTrait } from './load-entity.trait';

interface Client {
  id: string;
  name: string;
}
interface Product extends Client {
  price: number;
}
describe('addLoadEntityTrait trait', () => {
  const featureSelector =
    createFeatureSelector<LoadEntityState<Client, 'client'>>('client');
  const featureSelector2 =
    createFeatureSelector<LoadEntityState<Product, 'product'>>('client');

  function init() {
    const traits = createEntityFeatureFactory(
      { entityName: 'entity', entitiesName: 'entities' },
      addLoadEntityTrait({
        entityName: 'client',
        actionProps: props<{ id: string }>(),
        actionSuccessProps: props<{ client: Client }>(),
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
      addLoadEntityTrait({
        entityName: 'client',
        actionProps: props<{ id: string }>(),
        actionSuccessProps: props<{ client: { id: string; name: string } }>(),
      }),
      addLoadEntityTrait({
        entityName: 'product',
        actionProps: props<{ id: string }>(),
        actionSuccessProps: props<{ product: Product }>(),
      })
    )({
      actionsGroupKey: 'Client',
      featureSelector: featureSelector2,
    });

    return { ...traits };
  }
  describe('selectors', () => {
    it('selectEntity should return right value ', () => {
      const { selectors } = init();
      expect(
        selectors.selectClient.projector({
          client: { name: 'gabs', id: '1' },
        })
      ).toEqual({ name: 'gabs', id: '1' });
    });
    it('isLoadingClientDetailsSelected should right value ', () => {
      const { selectors } = init();
      expect(
        selectors.isClientLoading.projector({
          clientStatus: 'loading',
        })
      ).toEqual(true);
      expect(
        selectors.isClientLoading.projector({
          clientStatus: 'success',
        })
      ).toEqual(false);
    });
    it('isSuccessClientDetailsSelected should return right value ', () => {
      const { selectors } = init();
      expect(
        selectors.isClientSuccess.projector({
          clientStatus: 'success',
        })
      ).toEqual(true);
      expect(
        selectors.isClientSuccess.projector({
          clientStatus: 'loading',
        })
      ).toEqual(false);
    });
    it('isFailClientDetailsSelected should return right value ', () => {
      const { selectors } = init();
      expect(
        selectors.isClientFail.projector({
          clientStatus: 'fail',
        })
      ).toEqual(true);
      expect(
        selectors.isClientFail.projector({
          clientStatus: 'loading',
        })
      ).toEqual(false);
    });
  });

  describe('reducer', () => {
    it('loadClientSuccess should set status to success and store the client', () => {
      const { reducer, actions } = init();
      const state = reducer(
        { clientStatus: 'loading' },
        actions.loadClientSuccess({
          client: { name: 'gabs', id: '1' },
        })
      );
      expect(state).toEqual({
        clientStatus: 'success',
        client: { name: 'gabs', id: '1' },
      });
    });
    it('loadClient should set status to loading ', () => {
      const { reducer, actions } = init();
      const state = reducer({}, actions.loadClient({ id: '1' }));
      expect(state).toEqual({ clientStatus: 'loading' });
    });
    it('loadClientFailure should set status to fail ', () => {
      const { reducer, actions } = init();
      const state = reducer({}, actions.loadClientFail());
      expect(state).toEqual({ clientStatus: 'fail' });
    });
  });

  describe('Smoke test with multiple loadEntity to ensure they dont conflict', () => {
    it('check actions are of different loadEntity are not conflicting', () => {
      const { reducer, actions, selectors } = initMultiple();
      let state = reducer(
        {},
        actions.loadProduct({
          id: 'A',
        })
      );
      state = reducer(
        state,
        actions.loadClient({
          id: '1',
        })
      );
      expect(selectors.isClientLoading.projector(state)).toEqual(true);
      expect(selectors.isProductLoading.projector(state)).toEqual(true);
      state = reducer(
        state,
        actions.loadClientSuccess({
          client: { id: '1', name: 'uno' },
        })
      );
      state = reducer(state, actions.loadProductFail());
      expect(selectors.isClientSuccess.projector(state)).toEqual(true);
      expect(selectors.isProductFail.projector(state)).toEqual(true);
    });
  });
});
