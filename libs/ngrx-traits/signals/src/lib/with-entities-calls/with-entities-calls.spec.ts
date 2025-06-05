import { signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { callConfig, withCalls } from '@ngrx-traits/signals';
import { patchState, signalStore, type, withState } from '@ngrx/signals';
import {
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { BehaviorSubject, first, of, Subject } from 'rxjs';

import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';
import { entityCallConfig } from './entity-call-config';
import { withEntitiesCalls } from './with-entities-calls';

type ProductDetail = Product & {
  detail?: { maker: string; releaseDate: string; image: string };
};
describe('withEntitiesCalls', () => {
  const onSuccess = jest.fn();
  const onError = jest.fn();

  const entity = type<ProductDetail>();
  const collection = 'products';
  const productDetail = {
    image: 'https://example.com/image.jpg',
    maker: 'Nintendo',
    releaseDate: '',
  };

  it('Successful call with no entityCallConfig should set status to loading and loaded ', async () => {
    TestBed.runInInjectionContext(() => {
      const apiResponse = new Subject<Partial<ProductDetail>>();
      const apiResponse2 = new Subject<Partial<ProductDetail>>();
      const apiResponse3 = new Subject<Partial<ProductDetail>>();
      const apiResponse4 = new Subject<Partial<ProductDetail>>();

      const Store = signalStore(
        { protectedState: false },
        withState({ foo: 'bar' }),
        withEntities({ entity }),
        withEntitiesCalls({
          entity,
          calls: () => ({
            loadProductDetail: ({
              entity,
            }: {
              entity: ProductDetail;
              is: string;
            }) => {
              return apiResponse;
            },
            loadProductDetail2: ({
              entity,
            }: {
              entity: ProductDetail;
              b: string;
            }) => {
              return apiResponse2;
            },
            loadProductDetail3: (entity: ProductDetail) => {
              return apiResponse3;
            },
            loadProductDetail4: (productId: string) => {
              return apiResponse4;
            },
          }),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));

      const product = mockProducts[0];
      const product2 = mockProducts[1];
      const product3 = mockProducts[2];
      const product4 = mockProducts[3];
      const productWithDetail = {
        ...product,
        detail: {
          image: 'https://example.com/image.jpg',
          maker: 'Nintendo',
          releaseDate: '',
        },
      };
      const productWithDetail2 = {
        ...product2,
        detail: {
          image: 'https://example.com/image.jpg',
          maker: 'Nintendo2',
          releaseDate: '',
        },
      };
      const productWithDetail3 = {
        ...product3,
        detail: {
          image: 'https://example.com/image.jpg',
          maker: 'Nintendo3',
          releaseDate: '',
        },
      };
      const productWithDetail4 = {
        ...product4,
        detail: {
          image: 'https://example.com/image.jpg',
          maker: 'Nintendo4',
          releaseDate: '',
        },
      };
      expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
      store.loadProductDetail({ entity: product, is: 'test' });
      expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
      apiResponse.next(productWithDetail);
      expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
      expect(store.entityMap()[product.id]).toEqual(productWithDetail);

      expect(store.isLoadProductDetail2Loading(product2.id)).toBeFalsy();
      store.loadProductDetail2({ entity: product2, b: 'test' });
      expect(store.isLoadProductDetail2Loading(product2.id)).toBeTruthy();
      apiResponse2.next(productWithDetail2);
      expect(store.isLoadProductDetail2Loaded(product2.id)).toBeTruthy();
      expect(store.entityMap()[product2.id]).toEqual(productWithDetail2);

      expect(store.isLoadProductDetail3Loading(product3.id)).toBeFalsy();
      store.loadProductDetail3(product3);
      expect(store.isLoadProductDetail3Loading(product3.id)).toBeTruthy();
      apiResponse3.next(productWithDetail3);
      expect(store.isLoadProductDetail3Loaded(product3.id)).toBeTruthy();
      expect(store.entityMap()[product3.id]).toEqual(productWithDetail3);

      expect(store.isLoadProductDetail4Loading(product4.id)).toBeFalsy();
      store.loadProductDetail4(product4.id);
      expect(store.isLoadProductDetail4Loading(product4.id)).toBeTruthy();
      apiResponse4.next(productWithDetail4);
      expect(store.isLoadProductDetail4Loaded(product4.id)).toBeTruthy();
      expect(store.entityMap()[product4.id]).toEqual(productWithDetail4);
    });
  });

  it('Successful call should set status to loading and loaded ', async () => {
    TestBed.runInInjectionContext(() => {
      const apiResponse = new Subject<Partial<ProductDetail>>();
      const Store = signalStore(
        { protectedState: false },
        withState({ foo: 'bar' }),
        withEntities({ entity }),
        withEntitiesCalls({
          entity,
          calls: () => ({
            loadProductDetail: entityCallConfig({
              call: ({ entity }: { entity: ProductDetail; is: string }) => {
                return apiResponse;
              },
              onSuccess,
              onError,
            }),
          }),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));

      const product = mockProducts[0];
      expect(store.isAnyLoadProductDetailLoading()).toBeFalsy();
      expect(store.areAllLoadProductDetailLoaded()).toBeFalsy();
      expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
      store.loadProductDetail({ entity: product, is: 'test' });
      expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
      expect(store.isAnyLoadProductDetailLoading()).toBeTruthy();
      apiResponse.next({ detail: productDetail });
      expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
      expect(store.areAllLoadProductDetailLoaded()).toBeTruthy();
      expect(store.entityMap()[product.id].detail).toEqual(productDetail);
    });
  });

  it('Fail on a call should set status return error ', async () => {
    const consoleError = jest.spyOn(console, 'error');
    consoleError.mockReset();
    TestBed.runInInjectionContext(() => {
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<{
          detail: {
            maker: string;
            releaseDate: string;
            image: string;
          };
        }>();
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse;
                },
                paramsSelectId: ({ id }) => id,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        const product = mockProducts[0];
        expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
        expect(store.isAnyLoadProductDetailLoading()).toBeFalsy();
        store.loadProductDetail({ id: product.id });
        apiResponse.error(new Error('fail'));
        expect(store.loadProductDetailError(product.id)).toEqual(
          new Error('fail'),
        );
        expect(store.loadProductDetailErrors()).toEqual([new Error('fail')]);
        expect(store.entityMap()[product.id].detail).toBe(undefined);
        expect(consoleError).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('Successful call using collection, should set status to loading and loaded ', async () => {
    TestBed.runInInjectionContext(() => {
      const apiResponse = new Subject<Partial<ProductDetail>>();
      const Store = signalStore(
        { protectedState: false },
        withState({ foo: 'bar' }),
        withEntities({ entity, collection }),
        withEntitiesCalls({
          entity,
          collection,
          calls: () => ({
            loadProductDetail: entityCallConfig({
              call: ({ id }: { id: string; apiKey: string }) => {
                return apiResponse;
              },
              paramsSelectId: ({ id }) => id,
              onSuccess,
              onError,
            }),
          }),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));

      const product = mockProducts[0];
      expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
      store.loadProductDetail({ id: product.id, apiKey: 'test' });
      expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
      apiResponse.next({ detail: productDetail });
      expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
      expect(store.productsEntityMap()[product.id].detail).toEqual(
        productDetail,
      );
    });
  });

  it('passing a signal should call when signal value changes ', async () => {
    TestBed.runInInjectionContext(() => {
      let apiResponse = new Subject<Partial<ProductDetail>>();
      const Store = signalStore(
        { protectedState: false },
        withState({ foo: 'bar' }),
        withEntities({ entity }),
        withEntitiesCalls({
          entity,
          calls: () => ({
            loadProductDetail: entityCallConfig({
              call: ({ id }: { id: string }) => {
                return apiResponse;
              },
              paramsSelectId: ({ id }) => id,
              onSuccess,
              onError,
            }),
          }),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));

      const product = mockProducts[0];
      const param = signal({ id: mockProducts[0].id });
      expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
      store.loadProductDetail(param);
      TestBed.flushEffects();
      expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
      apiResponse.next({ detail: productDetail });
      expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
      expect(store.entityMap()[product.id].detail).toEqual(productDetail);
      apiResponse.complete();

      apiResponse = new Subject<Partial<ProductDetail>>();
      const product2 = mockProducts[2];
      param.set({ id: product2.id });
      TestBed.flushEffects();
      expect(store.isLoadProductDetailLoading(product2.id)).toBeTruthy();
      apiResponse.next({ detail: { ...productDetail, maker: 'Sony' } });
      expect(store.isLoadProductDetailLoaded(product2.id)).toBeTruthy();
      expect(store.entityMap()[product2.id].detail).toEqual({
        ...productDetail,
        maker: 'Sony',
      });
    });
  });

  it('passing a observable should call when value changes ', async () => {
    TestBed.runInInjectionContext(() => {
      let apiResponse = new Subject<Partial<ProductDetail>>();
      const Store = signalStore(
        { protectedState: false },
        withState({ foo: 'bar' }),
        withEntities({ entity }),
        withEntitiesCalls({
          entity,
          calls: () => ({
            loadProductDetail: entityCallConfig({
              call: ({ id }: { id: string }) => {
                return apiResponse;
              },
              paramsSelectId: ({ id }) => id,
              onSuccess,
              onError,
            }),
          }),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));

      const product = mockProducts[0];
      const param = new BehaviorSubject({ id: mockProducts[0].id });
      expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
      store.loadProductDetail(param);
      TestBed.flushEffects();
      expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
      apiResponse.next({ detail: productDetail });
      expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
      expect(store.entityMap()[product.id].detail).toEqual(productDetail);
      apiResponse.complete();

      apiResponse = new Subject<Partial<ProductDetail>>();
      const product2 = mockProducts[2];
      param.next({ id: product2.id });
      TestBed.flushEffects();
      expect(store.isLoadProductDetailLoading(product2.id)).toBeTruthy();
      apiResponse.next({ detail: { ...productDetail, maker: 'Sony' } });
      expect(store.isLoadProductDetailLoaded(product2.id)).toBeTruthy();
      expect(store.entityMap()[product2.id].detail).toEqual({
        ...productDetail,
        maker: 'Sony',
      });
    });
  });

  it('Fail on a call should set status return error with correct type if mapError is used ', async () => {
    TestBed.runInInjectionContext(() => {
      let apiResponse = new Subject<Partial<ProductDetail>>();
      const Store = signalStore(
        { protectedState: false },
        withState({ foo: 'bar' }),
        withEntities({ entity }),
        withEntitiesCalls({
          entity,
          calls: () => ({
            loadProductDetail: entityCallConfig({
              call: ({ id }: { id: string }) => {
                return apiResponse;
              },
              paramsSelectId: ({ id }) => id,
              mapError: (error, { id }) => (error as Error).message + ' ' + id,
              onSuccess,
              onError,
            }),
          }),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const product = mockProducts[0];
      expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
      store.loadProductDetail({ id: product.id });
      apiResponse.error(new Error('fail'));
      expect(store.loadProductDetailError(product.id)).toEqual(
        'fail ' + product.id,
      );
      expect(store.entityMap()[product.id].detail).toBe(undefined);
      expect(onError).toHaveBeenCalledWith('fail ' + product.id, {
        id: product.id,
      });
    });
  });

  it('check onSuccess receives params', async () => {
    const onSuccess = jest.fn();
    TestBed.runInInjectionContext(() => {
      let apiResponse = new Subject<Partial<ProductDetail>>();
      const Store = signalStore(
        { protectedState: false },
        withState({ foo: 'bar' }),
        withState({ ok: false }),
        withEntities({ entity }),
        withEntitiesCalls({
          entity,
          calls: () => ({
            loadProductDetail: entityCallConfig({
              call: ({ id }: { id: string }) => {
                return apiResponse;
              },
              paramsSelectId: ({ id }) => id,
              mapError: (error, { id }) => (error as Error).message + ' ' + id,
              onSuccess: (result, { id }, previousResult) => {
                onSuccess(result, { id }, previousResult);
                // patchState should be able to update the store inside onSuccess
                patchState(store, { foo: result.detail?.maker, ok: true });
              },
              onError,
            }),
          }),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const product = mockProducts[0];
      expect(store.isLoadProductDetailLoading(product)).toBeFalsy();
      store.loadProductDetail({ id: product.id });
      expect(store.isLoadProductDetailLoading(product)).toBeTruthy();
      apiResponse.next({ detail: productDetail });
      expect(store.isLoadProductDetailLoaded(product)).toBeTruthy();
      expect(store.entityMap()[product.id].detail).toEqual(productDetail);
      expect(store.foo()).toBe('Nintendo');
      expect(store.ok()).toBe(true);
      expect(onSuccess).toHaveBeenCalledWith(
        { detail: productDetail },
        { id: product.id },
        product,
      );
    });
  });
  it('Should be able to load multiple entities ', async () => {
    TestBed.runInInjectionContext(() => {
      let apiResponses = mockProducts.slice(0, 5).reduce(
        (acc, currentValue) => {
          acc[currentValue.id] = new Subject<Partial<ProductDetail>>();
          return acc;
        },
        {} as {
          [key: string]: Subject<Partial<ProductDetail>>;
        },
      );

      const Store = signalStore(
        { protectedState: false },
        withState({ foo: 'bar' }),
        withState({ ok: false }),
        withEntities({ entity }),
        withEntitiesCalls({
          entity,
          calls: () => ({
            loadProductDetail: entityCallConfig({
              call: ({ id }: { id: string }) => {
                return apiResponses[id];
              },
              paramsSelectId: ({ id }) => id,
              onSuccess,
              onError,
            }),
          }),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));

      const product = mockProducts[0];
      const product2 = mockProducts[1];
      expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
      store.loadProductDetail({ id: product.id });
      expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
      store.loadProductDetail({ id: product2.id });
      expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
      expect(store.isLoadProductDetailLoading(product2.id)).toBeTruthy();
      apiResponses[product.id].next({ detail: productDetail });
      expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
      expect(store.entityMap()[product.id].detail).toEqual(productDetail);
      expect(store.isLoadProductDetailLoading(product2.id)).toBeTruthy();
      apiResponses[product2.id].next({
        detail: { ...productDetail, maker: 'Sony' },
      });
      expect(store.isLoadProductDetailLoaded(product2.id)).toBeTruthy();
      expect(store.entityMap()[product2.id].detail).toEqual({
        ...productDetail,
        maker: 'Sony',
      });
    });
  });

  it('returning a promise should output when value returns ', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      let resolve: any = undefined;
      const apiResponse = new Promise<Partial<ProductDetail>>(
        (_resolve, reject) => {
          resolve = _resolve;
        },
      );
      const Store = signalStore(
        { protectedState: false },
        withState({ foo: 'bar' }),
        withEntities({ entity }),
        withEntitiesCalls({
          entity,
          calls: () => ({
            loadProductDetail: entityCallConfig({
              call: ({ id }: { id: string }) => {
                return apiResponse;
              },
              paramsSelectId: ({ id }) => id,
              onSuccess,
              onError,
            }),
          }),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));

      const product = mockProducts[0];
      expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
      store.loadProductDetail({ id: product.id });
      expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
      resolve({ detail: productDetail });
      tick();
      expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
      expect(store.entityMap()[product.id].detail).toEqual(productDetail);
    });
  }));

  describe('skipWhen function', () => {
    it('returning true in skipWhen should skip call ', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse;
                },
                skipWhen: () => true,
                paramsSelectId: ({ id }) => id,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));

        const product = mockProducts[0];
        expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
        store.loadProductDetail({ id: product.id });
        expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeFalsy();
        expect(store.entityMap()[product.id].detail).toBeUndefined();
        expect(consoleWarn).toHaveBeenCalledWith(
          'EntityCall loadProductDetail is skip',
        );
      });
    });

    it('returning true in skipWhen should skip call using previousResult ', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      const apiResponse = new Subject<Partial<ProductDetail>>();
      TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: (entity: ProductDetail) => {
                  return apiResponse.pipe(first());
                },
                skipWhen: (param, previousResult) => previousResult?.detail,
                onSuccess: (result, param, previousResult) => {
                  onSuccess(result, param, previousResult);
                },
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));

        const product = mockProducts[0];

        expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
        store.loadProductDetail(product);
        expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
        expect(store.entityMap()[product.id].detail).not.toBeUndefined();
        expect(consoleWarn).not.toHaveBeenCalledWith(
          'EntityCall loadProductDetail is skip',
        );

        store.loadProductDetail(product);
        expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeFalsy();
        expect(store.entityMap()[product.id].detail).not.toBeUndefined();
        expect(consoleWarn).toHaveBeenCalledWith(
          'EntityCall loadProductDetail is skip',
        );
      });
    });

    it('returning false in skipWhen should make the  call ', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse;
                },
                skipWhen: () => false,
                paramsSelectId: ({ id }) => id,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));

        const product = mockProducts[0];
        expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
        store.loadProductDetail({ id: product.id });
        expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
        expect(store.entityMap()[product.id].detail).toEqual(productDetail);
        expect(consoleWarn).not.toHaveBeenCalledWith('Call testCall is skip');
      });
    });

    it('returning an Observable with true in skipWhen should skip call', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse;
                },
                skipWhen: () => of(true),
                paramsSelectId: ({ id }) => id,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));

        const product = mockProducts[0];
        expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
        store.loadProductDetail({ id: product.id });
        expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeFalsy();
        expect(store.entityMap()[product.id].detail).toBeUndefined();
        expect(consoleWarn).toHaveBeenCalledWith(
          'EntityCall loadProductDetail is skip',
        );
      });
    });
    it('returning an Observable with false in skipWhen should run call ', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse;
                },
                skipWhen: () => of(false),
                paramsSelectId: ({ id }) => id,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));

        const product = mockProducts[0];
        expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
        store.loadProductDetail({ id: product.id });
        expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
        expect(store.entityMap()[product.id].detail).toEqual(productDetail);
        expect(consoleWarn).not.toHaveBeenCalledWith('Call testCall is skip');
      });
    });

    it('returning a Promise with true in skipWhen should skip call', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse;
                },
                skipWhen: () => Promise.resolve(true),
                paramsSelectId: ({ id }) => id,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));

        const product = mockProducts[0];
        expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
        store.loadProductDetail({ id: product.id });
        expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeFalsy();
        expect(store.entityMap()[product.id].detail).toBeUndefined();
        expect(consoleWarn).toHaveBeenCalledWith(
          'EntityCall loadProductDetail is skip',
        );
      });
    });
    it('returning a Promise with false in skipWhen should run call ', fakeAsync(() => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });

      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        let v = entityCallConfig({
          call: ({ id }: { id: string }) => {
            return apiResponse;
          },
          paramsSelectId: ({ id }) => id,
          skipWhen: () => Promise.resolve(false),
          onSuccess,
          onError,
        });
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse;
                },
                skipWhen: () => Promise.resolve(false),
                paramsSelectId: ({ id }) => id,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));

        const product = mockProducts[0];
        expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
        store.loadProductDetail({ id: product.id });
        tick();
        expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
        expect(store.entityMap()[product.id].detail).toEqual(productDetail);
        expect(consoleWarn).not.toHaveBeenCalledWith('Call testCall is skip');
      });
    }));
  });

  describe('when using callWith', () => {
    it('should run on init when call has params and callWith = { id: "1" }', async () => {
      const product = mockProducts[0];
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse;
                },
                paramsSelectId: ({ id }) => id,
                callWith: { id: product.id },
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));

        expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
        expect(store.entityMap()[product.id].detail).toEqual(productDetail);
      });
    });

    it('should not run on init when call has params and callWith = undefined', async () => {
      const product = mockProducts[0];
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse;
                },
                paramsSelectId: ({ id }) => id,
                callWith: undefined,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));

        expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeFalsy();
        expect(store.entityMap()[product.id].detail).toBeUndefined();
      });
    });

    it('should run call everytime there is new values if callWith is a signal and call has params', async () => {
      const product = mockProducts[0];
      const product2 = mockProducts[1];
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const idSignal = signal({ id: product.id });
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse;
                },
                paramsSelectId: ({ id }) => id,
                callWith: idSignal,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        TestBed.flushEffects();
        expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
        expect(store.entityMap()[product.id].detail).toEqual(productDetail);

        idSignal.set({ id: product2.id });
        TestBed.flushEffects();
        expect(store.isLoadProductDetailLoading(product2.id)).toBeTruthy();
        apiResponse.next({ detail: { ...productDetail, maker: 'Sony' } });
        expect(store.isLoadProductDetailLoaded(product2.id)).toBeTruthy();
        expect(store.entityMap()[product2.id].detail).toEqual({
          ...productDetail,
          maker: 'Sony',
        });
      });
    });

    it('should run call everytime there is new truthy values if callWith is a observable and call params', async () => {
      const product = mockProducts[0];
      const product2 = mockProducts[1];
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const id$ = new BehaviorSubject({ id: product.id });
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse;
                },
                paramsSelectId: ({ id }) => id,
                callWith: id$,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        TestBed.flushEffects();
        expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
        expect(store.entityMap()[product.id].detail).toEqual(productDetail);

        id$.next({ id: product2.id });
        TestBed.flushEffects();
        expect(store.isLoadProductDetailLoading(product2.id)).toBeTruthy();
        apiResponse.next({ detail: { ...productDetail, maker: 'Sony' } });
        expect(store.isLoadProductDetailLoaded(product2.id)).toBeTruthy();
        expect(store.entityMap()[product2.id].detail).toEqual({
          ...productDetail,
          maker: 'Sony',
        });
      });
    });

    it('should run call everytime there is new truthy values if callWith is a function and call has params', async () => {
      const product = mockProducts[0];
      const product2 = mockProducts[1];
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const idSignal = signal({ id: product.id });
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse;
                },
                paramsSelectId: ({ id }) => id,
                callWith: () => ({ id: idSignal().id }),
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        TestBed.flushEffects();
        expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
        expect(store.entityMap()[product.id].detail).toEqual(productDetail);

        idSignal.set({ id: product2.id });
        TestBed.flushEffects();
        expect(store.isLoadProductDetailLoading(product2.id)).toBeTruthy();
        apiResponse.next({ detail: { ...productDetail, maker: 'Sony' } });
        expect(store.isLoadProductDetailLoaded(product2.id)).toBeTruthy();
        expect(store.entityMap()[product2.id].detail).toEqual({
          ...productDetail,
          maker: 'Sony',
        });
      });
    });

    it('should not run call everytime there is new undefined values when callWith is a signal and not skipWhen is defined', async () => {
      const product = mockProducts[0];
      const product2 = mockProducts[1];
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const idSignal = signal<{ id: string } | undefined>({ id: product.id });
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse.pipe(first());
                },
                paramsSelectId: ({ id }) => id,
                callWith: idSignal,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        TestBed.flushEffects();
        expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
        expect(store.entityMap()[product.id].detail).toEqual(productDetail);

        idSignal.set(undefined);
        TestBed.flushEffects();
        expect(store.isLoadProductDetailLoading(product2.id)).toBeFalsy();
        apiResponse.next({ detail: { ...productDetail, maker: 'Sony' } });
        expect(store.isLoadProductDetailLoaded(product2.id)).toBeFalsy();
        expect(store.entityMap()[product2.id].detail).toBeUndefined();
      });
    });

    it('should not run call everytime there is a undefined value when callWith is a observable and skipWhen is not defined', async () => {
      const product = mockProducts[0];
      const product2 = mockProducts[1];
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();

        const id$ = new BehaviorSubject<{ id: string } | undefined>({
          id: product.id,
        });
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: ({ id }: { id: string }) => {
                  return apiResponse.pipe(first());
                },
                paramsSelectId: ({ id }) => id,
                callWith: id$,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        TestBed.flushEffects();
        expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
        expect(store.entityMap()[product.id].detail).toEqual(productDetail);

        id$.next(undefined);
        TestBed.flushEffects();
        expect(store.isLoadProductDetailLoading(product2.id)).toBeFalsy();
        apiResponse.next({ detail: { ...productDetail, maker: 'Sony' } });
        expect(store.isLoadProductDetailLoaded(product2.id)).toBeFalsy();
        expect(store.entityMap()[product2.id].detail).toBeUndefined();
      });
    });

    it('should run call everytime there is new undefined values when callWith is a signal  and  skipWhen is defined that allows them', async () => {
      const product = mockProducts[0];
      const fn = jest.fn();
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const idSignal = signal<{ id: string } | undefined>({ id: product.id });
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: (options: { id: string } | undefined) => {
                  fn(options);
                  return apiResponse.pipe(first());
                },
                paramsSelectId: (options) => options?.id + '',
                skipWhen: () => false,
                callWith: idSignal,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        TestBed.flushEffects();
        expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
        expect(store.entityMap()[product.id].detail).toEqual(productDetail);

        idSignal.set(undefined);
        TestBed.flushEffects();
        expect(fn).toHaveBeenCalledWith(undefined);
      });
    });

    it('should run call everytime there is new undefined values when callWith is a function  and  skipWhen is defined that allows them', async () => {
      const product = mockProducts[0];
      const fn = jest.fn();
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const idSignal = signal<{ id: string } | undefined>({ id: product.id });
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: (options: { id: string } | undefined) => {
                  fn(options);
                  return apiResponse.pipe(first());
                },
                paramsSelectId: (options) => options?.id + '',
                skipWhen: () => false,
                callWith: () =>
                  idSignal() ? { id: idSignal()!.id } : undefined,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        TestBed.flushEffects();
        expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
        expect(store.entityMap()[product.id].detail).toEqual(productDetail);

        idSignal.set(undefined);
        TestBed.flushEffects();
        expect(fn).toHaveBeenCalledWith(undefined);
      });
    });

    it('should run call everytime there is new undefined values when callWith is a observable  and  skipWhen is defined that allows them', async () => {
      const product = mockProducts[0];
      const fn = jest.fn();
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<Partial<ProductDetail>>();
        const id$ = new BehaviorSubject<{ id: string } | undefined>({
          id: product.id,
        });
        const Store = signalStore(
          { protectedState: false },
          withState({ foo: 'bar' }),
          withEntities({ entity }),
          withEntitiesCalls({
            entity,
            calls: () => ({
              loadProductDetail: entityCallConfig({
                call: (options: { id: string } | undefined) => {
                  fn(options);
                  return apiResponse.pipe(first());
                },
                paramsSelectId: (options) => options?.id + '',
                skipWhen: () => false,
                callWith: id$,
                onSuccess,
                onError,
              }),
            }),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        TestBed.flushEffects();
        expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
        apiResponse.next({ detail: productDetail });
        expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
        expect(store.entityMap()[product.id].detail).toEqual(productDetail);

        id$.next(undefined);
        TestBed.flushEffects();
        expect(fn).toHaveBeenCalledWith(undefined);
      });
    });
  });

  it('returning undefined should delete the entity', async () => {
    TestBed.runInInjectionContext(() => {
      const apiResponse = new Subject<Partial<ProductDetail> | undefined>();
      const Store = signalStore(
        { protectedState: false },
        withState({ foo: 'bar' }),
        withEntities({ entity }),
        withEntitiesCalls({
          entity,
          calls: () => ({
            deleteProduct: (entity: ProductDetail) => {
              return apiResponse;
            },
          }),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));

      const product = mockProducts[0];

      expect(store.isDeleteProductLoading(product.id)).toBeFalsy();
      store.deleteProduct(product);
      expect(store.isDeleteProductLoading(product.id)).toBeTruthy();
      apiResponse.next(undefined);
      expect(store.isDeleteProductLoaded(product.id)).toBeTruthy();
      expect(store.entityMap()[product.id]).toBeUndefined();
    });
  });

  it('storeFalse should allow you to do your own patchState', async () => {
    TestBed.runInInjectionContext(() => {
      const x = entityCallConfig({
        call: (options: { id: string; foo: 'test' }) => {
          return apiResponse.pipe(first());
        },
        paramsSelectId: (options) => options?.id,
        storeResult: false,
        onSuccess: (result, { id, foo }) => {
          patchState(
            store,
            updateEntity({
              id,
              changes: (state) => ({ ...state, ...result }),
            }),
            { foo },
          );
        },
      });
      const apiResponse = new Subject<Partial<ProductDetail>>();
      const Store = signalStore(
        { protectedState: false },
        withState({ foo: 'bar' }),
        withEntities({ entity }),
        withEntitiesCalls({
          entity,
          calls: (store) => ({
            loadProductDetail: x,
          }),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));

      const product = mockProducts[0];
      const productWithDetail = {
        ...product,
        detail: {
          image: 'https://example.com/image.jpg',
          maker: 'Nintendo',
          releaseDate: '',
        },
      };
      expect(store.isLoadProductDetailLoading(product.id)).toBeFalsy();
      store.loadProductDetail({ id: product.id, foo: 'test' });
      expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
      apiResponse.next(productWithDetail);
      expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
      expect(store.entityMap()[product.id]).toEqual(productWithDetail);
      expect(store.foo()).toEqual('test');
    });
  });

  it('Ensure call throws error is no id is provided', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {
      /* Empty */
    });
    TestBed.runInInjectionContext(() => {
      const apiResponse = new Subject<Partial<ProductDetail>>();

      const Store = signalStore(
        { protectedState: false },
        withState({ foo: 'bar' }),
        withEntities({ entity }),
        withEntitiesCalls({
          entity,
          calls: () => ({
            loadProductDetail: (op: { foo: string }) => {
              return apiResponse;
            },
          }),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.loadProductDetail({ foo: 'test' });
      expect(consoleError).toHaveBeenCalledWith(
        new Error(
          `The id could not be found in loadProductDetail params. Make sure the params of the call is of type  Entity | {entity: Entity} or provide a paramsSelectId function in the call config`,
        ),
      );
      consoleError.mockReset();
    });
  });

  it('multiple calls with the same id should be discarded till the fist is process', async () => {
    const product = mockProducts[0];
    const fn = jest.fn();
    TestBed.runInInjectionContext(() => {
      const apiResponse = new Subject<Partial<ProductDetail>>();
      const Store = signalStore(
        { protectedState: false },
        withState({ foo: 'bar' }),
        withEntities({ entity }),
        withEntitiesCalls({
          entity,
          calls: () => ({
            loadProductDetail: entityCallConfig({
              call: (options: { id: string } | undefined) => {
                fn(options);
                return apiResponse.pipe(first());
              },
              paramsSelectId: (options) => options?.id + '',
              skipWhen: () => false,
              onSuccess,
              onError,
            }),
          }),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));

      store.loadProductDetail({ id: product.id });
      store.loadProductDetail({ id: product.id });
      store.loadProductDetail({ id: product.id });

      expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
      expect(fn).toHaveBeenCalledTimes(1);
      apiResponse.next({ detail: productDetail });
      expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
      expect(store.entityMap()[product.id].detail).toEqual(productDetail);
      expect(fn).toHaveBeenCalledTimes(1);

      store.loadProductDetail({ id: product.id });
      expect(store.isLoadProductDetailLoading(product.id)).toBeTruthy();
      apiResponse.next({ detail: productDetail });
      expect(store.isLoadProductDetailLoaded(product.id)).toBeTruthy();
      expect(store.entityMap()[product.id].detail).toEqual(productDetail);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
