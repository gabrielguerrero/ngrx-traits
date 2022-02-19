import { Actions } from '@ngrx/effects';
import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { LoadEntityState } from './load-entity.model';
import { addLoadEntityTraits } from './load-entity.traits';

interface Client {
  id: string;
  name: string;
}
interface Product extends Client {
  price: number;
}
describe('addLoadEntityTraits trait', () => {
  let actions$: Actions;
  const featureSelector =
    createFeatureSelector<LoadEntityState<Client, 'client'>>('client');
  const featureSelector2 =
    createFeatureSelector<LoadEntityState<Product, 'product'>>('client');

  function init() {
    const traits = createEntityFeatureFactory(
      { entityName: 'entity', entitiesName: 'entities' },
      ...addLoadEntityTraits({
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
      ...addLoadEntityTraits({
        entityName: 'client',
        actionProps: props<{ id: string }>(),
        actionSuccessProps: props<{ client: { id: string; name: string } }>(),
      }),
      ...addLoadEntityTraits({
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
    it('isLoadingClientDetailsSelected should right value ', () => {
      const { selectors } = init();
      expect(
        selectors.selectClient.projector({
          client: { name: 'gabs', id: '1' },
        })
      ).toEqual({ name: 'gabs', id: '1' });
    });
  });

  describe('reducer', () => {
    it('createClientSuccess should set status to success and store the client', () => {
      const { reducer, actions, initialState } = init();
      const state = reducer(
        { loadClientStatus: 'loading' },
        actions.loadClientSuccess({
          client: { name: 'gabs', id: '1' },
        })
      );
      expect(state).toEqual({
        loadClientStatus: 'success',
        client: { name: 'gabs', id: '1' },
      });
    });
  });

  describe('Smoke test with multiple loadEntity to ensure they dont conflict', () => {
    it('check actions are of different loadEntity are not conflicting', () => {
      const { reducer, actions, selectors, initialState } = initMultiple();
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
      expect(selectors.isLoadingLoadClient.projector(state)).toEqual(true);
      expect(selectors.isLoadingLoadProduct.projector(state)).toEqual(true);
      state = reducer(
        state,
        actions.loadClientSuccess({
          client: { id: '1', name: 'uno' },
        })
      );
      state = reducer(state, actions.loadProductFail());
      expect(selectors.isSuccessLoadClient.projector(state)).toEqual(true);
      expect(selectors.isFailLoadProduct.projector(state)).toEqual(true);
    });
  });
});
