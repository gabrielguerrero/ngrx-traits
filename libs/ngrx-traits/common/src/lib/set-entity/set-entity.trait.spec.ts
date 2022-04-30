import { Actions } from '@ngrx/effects';
import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory } from '@ngrx-traits/core';
import { SetEntityState } from './set-entity.model';
import { addSetEntityTrait } from './set-entity.trait';

interface Client {
  id: string;
  name: string;
}
interface Product extends Client {
  price: number;
}
describe('addSetEntityTrait trait', () => {
  let actions$: Actions;
  const featureSelector =
    createFeatureSelector<SetEntityState<Client, 'client'>>('client');
  const featureSelector2 = createFeatureSelector<
    SetEntityState<Product, 'product'> & SetEntityState<Client, 'client'>
  >('clientProduct');

  function init() {
    const traits = createEntityFeatureFactory(
      { entityName: 'entity', entitiesName: 'entities' },
      addSetEntityTrait({
        entityName: 'client',
        actionProps: props<{ client: Client }>(),
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
      addSetEntityTrait({
        entityName: 'client',
        actionProps: props<{ client: Client }>(),
      }),
      addSetEntityTrait({
        entityName: 'product',
        actionProps: props<{ product: Product }>(),
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
  });

  describe('reducer', () => {
    it('setEntity should store the client', () => {
      const { reducer, actions, initialState } = init();
      const state = reducer(
        {},
        actions.setClient({
          client: { name: 'gabs', id: '1' },
        })
      );
      expect(state).toEqual({
        client: { name: 'gabs', id: '1' },
      });
    });
  });

  describe('Smoke test with multiple loadEntity to ensure they dont conflict', () => {
    it('check actions are of different loadEntity are not conflicting', () => {
      const { reducer, actions, selectors, initialState } = initMultiple();
      let state = reducer(
        {},
        actions.setProduct({
          product: {
            id: 'A',
            price: 123,
            name: 'a',
          },
        })
      );
      state = reducer(
        state,
        actions.setClient({
          client: { name: 'gabs', id: '1' },
        })
      );
      expect(selectors.selectClient.projector(state)).toEqual({
        name: 'gabs',
        id: '1',
      });
      expect(selectors.selectProduct.projector(state)).toEqual({
        id: 'A',
        price: 123,
        name: 'a',
      });
    });
  });
});
