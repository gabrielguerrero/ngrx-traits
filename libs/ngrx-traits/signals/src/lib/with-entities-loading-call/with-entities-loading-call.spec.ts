import { inject, Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { patchState, signalStore, type } from '@ngrx/signals';
import {
  entityConfig,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { delay, of, Subject, throwError } from 'rxjs';

import {
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesRemotePagination,
  withEntitiesRemoteScrollPagination,
} from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withEntitiesLoadingCall', () => {
  const entity = type<Product>();
  const collection = 'product';
  describe('using config as object', () => {
    describe('without collection setLoading should call fetch entities', () => {
      it('should setAllEntities if fetchEntities returns an Entity[] ', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
            }),
            withCallStatus(),
            withEntitiesLoadingCall({
              fetchEntities: () => {
                let result = [...mockProducts];
                return of(result);
              },
            }),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual(mockProducts);
        });
      }));

      describe('mapPipe', () => {
        it('should mapPipe = switchMap should only process last call ', fakeAsync(() => {
          TestBed.runInInjectionContext(() => {
            let aux = 0;
            const call = vi.fn().mockImplementation(() => {
              aux++;
              return of(mockProducts.slice(0, mockProducts.length - aux)).pipe(
                delay(100),
              );
            });
            const Store = signalStore(
              withEntities({
                entity,
              }),
              withCallStatus(),
              withEntitiesLoadingCall({
                fetchEntities: call,
                mapPipe: 'switchMap',
              }),
            );
            const store = new Store();
            tick();
            expect(store.entities()).toEqual([]);
            store.setLoading();
            tick(10);
            store.setLoading();
            tick(10);
            store.setLoading();
            expect(store.isLoading()).toBeTruthy();
            tick(150);
            expect(store.isLoading()).toBeFalsy();
            expect(store.entities().length).toEqual(mockProducts.length - 3);
          });
        }));

        it('should mapPipe = exhaustMap should only process first call ', fakeAsync(() => {
          TestBed.runInInjectionContext(() => {
            let aux = 0;
            const call = vi.fn().mockImplementation(() => {
              aux++;
              return of(mockProducts.slice(0, mockProducts.length - aux)).pipe(
                delay(120),
              );
            });
            const Store = signalStore(
              withEntities({
                entity,
              }),
              withCallStatus(),
              withEntitiesLoadingCall({
                fetchEntities: call,
                mapPipe: 'exhaustMap',
              }),
            );
            const store = new Store();
            tick();
            expect(store.entities()).toEqual([]);
            store.setLoading();
            tick(10);
            store.setLoading();
            tick(10);
            store.setLoading();
            expect(store.isLoading()).toBeTruthy();
            tick(150);
            expect(store.isLoading()).toBeFalsy();
            expect(store.entities().length).toEqual(mockProducts.length - 1);
          });
        }));

        it('should mapPipe = concatMap should process all calls in sequence ', fakeAsync(() => {
          TestBed.runInInjectionContext(() => {
            let aux = 0;
            const call = vi.fn().mockImplementation(() => {
              aux++;
              return of(mockProducts.slice(0, mockProducts.length - aux)).pipe(
                delay(100),
              );
            });
            const Store = signalStore(
              withEntities({
                entity,
              }),
              withCallStatus(),
              withEntitiesLoadingCall({
                fetchEntities: call,
                mapPipe: 'concatMap',
              }),
            );
            const store = new Store();
            tick();
            expect(store.entities()).toEqual([]);
            store.setLoading();
            tick(10);
            store.setLoading();
            tick(10);
            store.setLoading();
            expect(store.isLoading()).toBeTruthy();
            tick(110);
            expect(store.entities().length).toEqual(mockProducts.length - 1);
            tick(110);
            expect(store.entities().length).toEqual(mockProducts.length - 2);
            tick(110);
            expect(store.isLoaded()).toBeTruthy();
            expect(store.entities().length).toEqual(mockProducts.length - 3);
          });
        }));
      });

      it('should setAllEntities if fetchEntities returns an a {entities: Entity[]} ', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
            }),
            withCallStatus(),
            withEntitiesLoadingCall({
              fetchEntities: () => {
                let result = [...mockProducts];
                return of({ entities: result });
              },
            }),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual(mockProducts);
        });
      }));

      it('should setAllEntities with custom id if fetchEntities returns an a {entities: Entity[]} ', fakeAsync(() => {
        type ProductCustom = Omit<Product, 'id'> & { productId: string };
        const config = entityConfig({
          entity: type<ProductCustom>(),
          selectId: (p) => p.productId,
        });
        const mockProductsCustom = mockProducts.map(({ id, ...p }) => ({
          ...p,
          productId: id,
        }));
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              ...config,
            }),
            withCallStatus(),
            withEntitiesLoadingCall({
              ...config,
              fetchEntities: () => {
                let result = [...mockProductsCustom];
                return of({ entities: result });
              },
            }),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual(mockProductsCustom);
        });
      }));

      it('should setEntitiesPagedResult if fetchEntities returns an a {entities: Entity[], total: number} ', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
            }),
            withCallStatus(),
            withEntitiesRemotePagination({
              entity,
              pageSize: 10,
            }),
            withEntitiesLoadingCall({
              fetchEntities: ({ entitiesPagedRequest }) => {
                let result = [...mockProducts];
                const total = result.length;
                const options = {
                  skip: entitiesPagedRequest()?.startIndex,
                  take: entitiesPagedRequest()?.size,
                };
                if (options?.skip || options?.take) {
                  const skip = +(options?.skip ?? 0);
                  const take = +(options?.take ?? 0);
                  result = result.slice(skip, skip + take);
                }
                return of({ entities: result, total });
              },
            }),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual(mockProducts.slice(0, 30));
        });
      }));

      it('should call setLoaded and onSuccess if fetchEntities call is successful', fakeAsync(() => {
        const onSuccess = vi.fn();
        const onError = vi.fn();
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
            }),
            withCallStatus(),
            withEntitiesLoadingCall({
              fetchEntities: () => {
                let result = [...mockProducts];
                return of(result);
              },
              onSuccess,
              onError,
            }),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual(mockProducts);
          expect(store.isLoaded()).toBeTruthy();
          expect(onSuccess).toHaveBeenCalledWith(mockProducts);
          expect(onError).not.toHaveBeenCalled();
        });
      }));

      it('should skip storing entities when storeResult is false but still call onSuccess', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
            }),
            withCallStatus(),
            withEntitiesLoadingCall((store) => ({
              fetchEntities: () => {
                return of([...mockProducts]);
              },
              storeResult: false,
              onSuccess: (result) => {
                patchState(
                  store,
                  setAllEntities((result as Product[]).slice(0, 2)),
                );
              },
            })),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual(mockProducts.slice(0, 2));
          expect(store.isLoaded()).toBeTruthy();
        });
      }));

      it('should call setError and onError if fetchEntities call fails ', fakeAsync(() => {
        const consoleError = vi.spyOn(console, 'error');
        consoleError.mockClear();
        const onSuccess = vi.fn();
        const onError = vi.fn();
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
            }),
            withCallStatus(),
            withEntitiesLoadingCall({
              fetchEntities: () => {
                return throwError(() => new Error('fail'));
              },
              onSuccess,
              onError,
            }),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual([]);
          expect(store.error()).toEqual(new Error('fail'));
          expect(onError).toHaveBeenCalledWith(new Error('fail'));
          expect(onSuccess).not.toHaveBeenCalled();
          expect(consoleError).toHaveBeenCalledTimes(1);
        });
      }));

      it('should call setError and onError if fetchEntities call fails with correct type if mapError is used', fakeAsync(() => {
        const onSuccess = vi.fn();
        const onError = vi.fn();
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
            }),
            withCallStatus({ errorType: type<string>() }),
            withEntitiesLoadingCall({
              fetchEntities: () => {
                return throwError(() => new Error('fail'));
              },
              onSuccess,
              mapError: (error) => (error as Error).message,
              onError,
            }),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual([]);
          expect(store.error()).toEqual('fail');
          expect(onError).toHaveBeenCalledWith('fail');
          expect(onSuccess).not.toHaveBeenCalled();
        });
      }));
    });

    describe('with collection set[Collection]Loading should call fetch entities', () => {
      it('should setAllEntities if fetchEntities returns an Entity[] ', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
              collection,
            }),
            withCallStatus({ collection }),
            withEntitiesLoadingCall({
              collection,
              fetchEntities: () => {
                let result = [...mockProducts];
                return of(result);
              },
            }),
          );
          const store = new Store();
          tick();
          expect(store.productEntities()).toEqual([]);
          store.setProductEntitiesLoading();
          tick();
          expect(store.productEntities()).toEqual(mockProducts);
        });
      }));

      it('should setAllEntities if fetchEntities returns an a {entities: Entity[]} ', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
              collection,
            }),
            withCallStatus({ collection }),
            withEntitiesLoadingCall({
              collection,
              fetchEntities: () => {
                let result = [...mockProducts];
                return of({ entities: result });
              },
            }),
          );
          const store = new Store();
          tick();
          expect(store.productEntities()).toEqual([]);
          store.setProductEntitiesLoading();
          tick();
          expect(store.productEntities()).toEqual(mockProducts);
        });
      }));

      it('should set[Collection]Result if fetchEntities returns an a {entities: Entity[], total: number} ', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
              collection,
            }),
            withCallStatus({ collection }),
            withEntitiesRemotePagination({
              entity,
              collection,
              pageSize: 10,
            }),
            withEntitiesLoadingCall({
              collection,
              fetchEntities: ({ productEntitiesPagedRequest }) => {
                let result = [...mockProducts];
                const total = result.length;
                const options = {
                  skip: productEntitiesPagedRequest()?.startIndex,
                  take: productEntitiesPagedRequest()?.size,
                };
                if (options?.skip || options?.take) {
                  const skip = +(options?.skip ?? 0);
                  const take = +(options?.take ?? 0);
                  result = result.slice(skip, skip + take);
                }
                return of({ entities: result, total });
              },
            }),
          );
          const store = new Store();
          tick();
          expect(store.productEntities()).toEqual([]);
          store.setProductEntitiesLoading();
          tick();
          expect(store.productEntities()).toEqual(mockProducts.slice(0, 30));
        });
      }));

      it('should set[Collection]Result with customId if fetchEntities returns an a {entities: Entity[], total: number} ', fakeAsync(() => {
        type ProductCustom = Omit<Product, 'id'> & { productId: string };
        const config = entityConfig({
          entity: type<ProductCustom>(),
          selectId: (p) => p.productId,
          collection,
        });
        const mockProductsCustom = mockProducts.map(({ id, ...p }) => ({
          ...p,
          productId: id,
        }));
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities(config),
            withCallStatus(config),
            withEntitiesRemotePagination({
              ...config,
              pageSize: 10,
            }),
            withEntitiesLoadingCall({
              ...config,
              fetchEntities: ({ productEntitiesPagedRequest }) => {
                let result = [...mockProductsCustom];
                const total = result.length;
                const options = {
                  skip: productEntitiesPagedRequest()?.startIndex,
                  take: productEntitiesPagedRequest()?.size,
                };
                if (options?.skip || options?.take) {
                  const skip = +(options?.skip ?? 0);
                  const take = +(options?.take ?? 0);
                  result = result.slice(skip, skip + take);
                }
                return of({ entities: result, total });
              },
            }),
          );
          const store = new Store();
          tick();
          expect(store.productEntities()).toEqual([]);
          store.setProductEntitiesLoading();
          tick();
          expect(store.productEntities()).toEqual(
            mockProductsCustom.slice(0, 30),
          );
        });
      }));
    });
  });

  describe('using config as factory', () => {
    describe('without collection setLoading should call fetch entities', () => {
      it('should setAllEntities if fetchEntities returns an Entity[] ', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
            }),
            withCallStatus(),
            withEntitiesLoadingCall(() => ({
              fetchEntities: () => {
                let result = [...mockProducts];
                return of(result);
              },
            })),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual(mockProducts);
        });
      }));

      it('should setAllEntities if fetchEntities returns an a {entities: Entity[]} ', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
            }),
            withCallStatus(),
            withEntitiesLoadingCall(() => ({
              fetchEntities: () => {
                let result = [...mockProducts];
                return of({ entities: result });
              },
            })),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual(mockProducts);
        });
      }));

      it('should setEntitiesPagedResult if fetchEntities returns an a {entities: Entity[], total: number} ', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
            }),
            withCallStatus(),
            withEntitiesRemotePagination({
              entity,
              pageSize: 10,
            }),
            withEntitiesLoadingCall(({ entitiesPagedRequest }) => ({
              fetchEntities: () => {
                let result = [...mockProducts];
                const total = result.length;
                const options = {
                  skip: entitiesPagedRequest()?.startIndex,
                  take: entitiesPagedRequest()?.size,
                };
                if (options?.skip || options?.take) {
                  const skip = +(options?.skip ?? 0);
                  const take = +(options?.take ?? 0);
                  result = result.slice(skip, skip + take);
                }
                return of({ entities: result, total });
              },
            })),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual(mockProducts.slice(0, 30));
        });
      }));

      it('should call setLoaded and onSuccess if fetchEntities call is successful', fakeAsync(() => {
        const onSuccess = vi.fn();
        const onError = vi.fn();
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
            }),
            withCallStatus(),
            withEntitiesLoadingCall(() => ({
              fetchEntities: () => {
                let result = [...mockProducts];
                return of(result);
              },
              onSuccess,
              onError,
            })),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual(mockProducts);
          expect(store.isLoaded()).toBeTruthy();
          expect(onSuccess).toHaveBeenCalledWith(mockProducts);
          expect(onError).not.toHaveBeenCalled();
        });
      }));

      it('should call setError and onError if fetchEntities call fails ', fakeAsync(() => {
        const onSuccess = vi.fn();
        const onError = vi.fn();
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
            }),
            withCallStatus(),
            withEntitiesLoadingCall(() => ({
              fetchEntities: () => {
                return throwError(() => new Error('fail'));
              },
              onSuccess,
              onError,
            })),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual([]);
          expect(store.error()).toEqual(new Error('fail'));
          expect(onError).toHaveBeenCalledWith(new Error('fail'));
          expect(onSuccess).not.toHaveBeenCalled();
        });
      }));

      it('should call setError and onError if fetchEntities call fails with correct type if mapError is used', fakeAsync(() => {
        const onSuccess = vi.fn();
        const onError = vi.fn();
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
            }),
            withCallStatus({ errorType: type<string>() }),
            withEntitiesLoadingCall(() => ({
              fetchEntities: () => {
                return throwError(() => new Error('fail'));
              },
              onSuccess,
              mapError: (error) => (error as Error).message,
              onError,
            })),
          );
          const store = new Store();
          tick();
          expect(store.entities()).toEqual([]);
          store.setLoading();
          tick();
          expect(store.entities()).toEqual([]);
          expect(store.error()).toEqual('fail');
          expect(onError).toHaveBeenCalledWith('fail');
          expect(onSuccess).not.toHaveBeenCalled();
        });
      }));
    });

    describe('with collection set[Collection]Loading should call fetch entities', () => {
      it('should setAllEntities if fetchEntities returns an Entity[] ', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
              collection,
            }),
            withCallStatus({ collection }),
            withEntitiesLoadingCall(() => ({
              collection,
              fetchEntities: () => {
                let result = [...mockProducts];
                return of(result);
              },
            })),
          );
          const store = new Store();
          tick();
          expect(store.productEntities()).toEqual([]);
          store.setProductEntitiesLoading();
          tick();
          expect(store.productEntities()).toEqual(mockProducts);
        });
      }));

      it('should setAllEntities if fetchEntities returns an a {entities: Entity[]} ', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
              collection,
            }),
            withCallStatus({ collection }),
            withEntitiesLoadingCall(() => ({
              collection,
              fetchEntities: () => {
                let result = [...mockProducts];
                return of({ entities: result });
              },
            })),
          );
          const store = new Store();
          tick();
          expect(store.productEntities()).toEqual([]);
          store.setProductEntitiesLoading();
          tick();
          expect(store.productEntities()).toEqual(mockProducts);
        });
      }));

      it('should set[Collection]Result if fetchEntities returns an a {entities: Entity[], total: number} ', fakeAsync(() => {
        TestBed.runInInjectionContext(() => {
          const Store = signalStore(
            withEntities({
              entity,
              collection,
            }),
            withCallStatus({ collection }),
            withEntitiesRemotePagination({
              entity,
              collection,
              pageSize: 10,
            }),
            withEntitiesLoadingCall(({ productEntitiesPagedRequest }) => ({
              collection,
              fetchEntities: () => {
                let result = [...mockProducts];
                const total = result.length;
                const options = {
                  skip: productEntitiesPagedRequest()?.startIndex,
                  take: productEntitiesPagedRequest()?.size,
                };
                if (options?.skip || options?.take) {
                  const skip = +(options?.skip ?? 0);
                  const take = +(options?.take ?? 0);
                  result = result.slice(skip, skip + take);
                }
                return of({ entities: result, total });
              },
            })),
          );
          const store = new Store();
          tick();
          expect(store.productEntities()).toEqual([]);
          store.setProductEntitiesLoading();
          tick();
          expect(store.productEntities()).toEqual(mockProducts.slice(0, 30));
        });
      }));
    });
  });
  describe('two-arg (entityConfig, options) form', () => {
    it('with collection should setAllEntities if fetchEntities returns an Entity[], same as single object form', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withEntities({
            entity,
            collection,
          }),
          withCallStatus({ collection }),
          withEntitiesLoadingCall(
            { entity, collection },
            {
              fetchEntities: () => {
                let result = [...mockProducts];
                return of(result);
              },
            },
          ),
        );
        const store = new Store();
        tick();
        expect(store.productEntities()).toEqual([]);
        store.setProductEntitiesLoading();
        tick();
        expect(store.productEntities()).toEqual(mockProducts);
      });
    }));

    it('with collection options as a store-factory that calls inject() works', fakeAsync(() => {
      @Injectable({ providedIn: 'root' })
      class TestProductsService {
        getProducts() {
          return of([...mockProducts]);
        }
      }
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withEntities({
            entity,
            collection,
          }),
          withCallStatus({ collection }),
          withEntitiesLoadingCall(
            { entity, collection },
            (store, service = inject(TestProductsService)) => ({
              fetchEntities: () => service.getProducts(),
            }),
          ),
        );
        const store = new Store();
        tick();
        expect(store.productEntities()).toEqual([]);
        store.setProductEntitiesLoading();
        tick();
        expect(store.productEntities()).toEqual(mockProducts);
      });
    }));
  });

  describe('missing required features', () => {
    it('should error if withCallStatus is missing', () => {
      // @ts-expect-error withEntitiesLoadingCall requires withCallStatus({ collection: 'product' })
      signalStore(
        withEntities({ entity, collection }),
        withEntitiesLoadingCall({
          collection,
          fetchEntities: () => of([...mockProducts]),
        }),
      );
    });

    it('should error if withCallStatus is missing without collection', () => {
      // @ts-expect-error withEntitiesLoadingCall requires withCallStatus()
      signalStore(
        withEntities({ entity }),
        withEntitiesLoadingCall({
          fetchEntities: () => of([...mockProducts]),
        }),
      );
    });

    it('should error if withEntities is missing', () => {
      // @ts-expect-error withEntitiesLoadingCall requires withEntities({ entity, collection: 'product' })
      signalStore(
        withCallStatus({ collection }),
        withEntitiesLoadingCall({
          collection,
          entity,
          fetchEntities: () => of([...mockProducts]),
        }),
      );
    });
  });

  describe('fetchEntities result', () => {
    it('should require the result the pagination feature accepts', () => {
      signalStore(
        withEntities({ entity, collection }),
        withCallStatus({ collection }),
        withEntitiesRemotePagination({ entity, collection, pageSize: 10 }),
        withEntitiesLoadingCall({
          collection,
          // withEntitiesRemotePagination stores { entities, total }, so
          // returning the entities alone is not enough
          // @ts-expect-error
          fetchEntities: () => of([...mockProducts]),
        }),
      );
    });

    it('should allow any of the results the scroll pagination accepts', () => {
      const Store = signalStore(
        withEntities({ entity, collection }),
        withCallStatus({ collection }),
        withEntitiesRemoteScrollPagination({
          entity,
          collection,
          pageSize: 10,
        }),
        withEntitiesLoadingCall({
          collection,
          fetchEntities: () => of({ entities: [...mockProducts] }),
        }),
      );
      expect(Store).toBeDefined();
    });

    it('should not leak the explanation into onSuccess', () => {
      const Store = signalStore(
        withEntities({ entity, collection }),
        withCallStatus({ collection }),
        withEntitiesRemotePagination({ entity, collection, pageSize: 10 }),
        withEntitiesLoadingCall({
          collection,
          fetchEntities: () =>
            of({ entities: [...mockProducts], total: mockProducts.length }),
          // total and entities are reachable without narrowing
          onSuccess: (result) =>
            expect(result.total).toBe(result.entities.length),
        }),
      );
      expect(Store).toBeDefined();
    });
  });

  describe('entities resource view', () => {
    it('should expose the entities and their loading call as a resource', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const fetchEntities = vi.fn(() =>
          of([...mockProducts]).pipe(delay(10)),
        );
        const Store = signalStore(
          withEntities({ entity }),
          withCallStatus(),
          withEntitiesLoadingCall({ fetchEntities }),
        );
        const store = new Store();
        tick();
        const res = store.entitiesResource();
        expect(res.status()).toBe('idle');
        expect(res.value()).toEqual([]);
        expect(res.hasValue()).toBe(true);
        expect(res.snapshot()).toEqual({ status: 'idle', value: [] });

        // setLoading is what triggers the fetch, the view only reads it
        store.setLoading();
        expect(res.status()).toBe('loading');
        expect(res.isLoading()).toBe(true);
        expect(store.isLoading()).toBe(true);
        tick(10);
        expect(res.status()).toBe('resolved');
        expect(res.isLoading()).toBe(false);
        expect(res.value()).toEqual(mockProducts);
        expect(res.value()).toBe(store.entities());
        expect(fetchEntities).toHaveBeenCalledTimes(1);

        store.setLoading();
        expect(res.status()).toBe('reloading');
        expect(res.value()).toEqual(mockProducts);
        tick(10);
        expect(res.status()).toBe('resolved');
        expect(fetchEntities).toHaveBeenCalledTimes(2);
        expectTypeOf(res.value()).toEqualTypeOf<Product[]>();
      });
    }));

    it('should be named after the collection', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withEntities({ entity, collection }),
          withCallStatus({ collection, initialValue: 'loading' }),
          withEntitiesLoadingCall({
            collection,
            fetchEntities: () => of([...mockProducts]).pipe(delay(10)),
          }),
        );
        const store = new Store();
        const res = store.productEntitiesResource();
        // loading from init, never loaded before
        expect(res.status()).toBe('loading');
        tick(10);
        expect(res.status()).toBe('resolved');
        expect(res.value()).toBe(store.productEntities());
      });
    }));

    it('should report the error state', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withEntities({ entity, collection }),
          withCallStatus({ collection, errorType: type<string>() }),
          withEntitiesLoadingCall({
            collection,
            fetchEntities: () => throwError(() => new Error('fail')),
            mapError: (error) => (error as Error).message,
          }),
        );
        const store = new Store();
        tick();
        const res = store.productEntitiesResource();
        store.setProductEntitiesLoading();
        tick();
        expect(res.status()).toBe('error');
        expect(res.error()).toBe('fail');
        expect(res.hasValue()).toBe(false);
        expect(res.snapshot()).toEqual({ status: 'error', error: 'fail' });
        expectTypeOf(res.error()).toEqualTypeOf<string | undefined>();
      });
    }));

    it('should be read only, the entities are written through the store', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity, collection }),
          withCallStatus({ collection }),
          withEntitiesLoadingCall({
            collection,
            fetchEntities: () => of([...mockProducts]).pipe(delay(10)),
          }),
        );
        const store = new Store();
        tick();
        const res = store.productEntitiesResource();
        // @ts-expect-error the view does not write the store
        expect(res.set).toBeUndefined();

        // setAllEntities is what a store method would do, and the view reads it
        patchState(
          store,
          setAllEntities(mockProducts.slice(0, 2), { collection }),
        );
        expect(res.value()).toEqual(mockProducts.slice(0, 2));
        // entities are there but nothing has been loaded yet, so a load in
        // progress is a first load, not a reload
        store.setProductEntitiesLoading();
        expect(res.status()).toBe('loading');
        tick(10);
        expect(res.status()).toBe('resolved');
        expect(res.value()).toEqual(mockProducts);

        store.setProductEntitiesLoading();
        expect(res.status()).toBe('reloading');
        tick(10);
      });
    }));

    it('should count a hydrated loaded status as loaded', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity, collection }),
          withCallStatus({ collection }),
          withEntitiesLoadingCall({
            collection,
            fetchEntities: () => of([...mockProducts]).pipe(delay(10)),
          }),
        );
        const store = new Store();
        tick();
        // the entities and the status arrive without any fetch running here,
        // as they do with withServerStateTransfer or withSyncToWebStorage
        patchState(
          store,
          setAllEntities(mockProducts.slice(0, 2), { collection }),
        );
        store.setProductEntitiesLoaded();

        const res = store.productEntitiesResource();
        expect(res.status()).toBe('resolved');
        // so a refresh keeps the list on screen instead of starting over
        store.setProductEntitiesLoading();
        expect(res.status()).toBe('reloading');
        tick(10);
        expect(res.status()).toBe('resolved');
      });
    }));

    it('should report reloading even if nothing read the status in between', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity, collection }),
          withCallStatus({ collection }),
          withEntitiesLoadingCall({
            collection,
            fetchEntities: () => of([...mockProducts]).pipe(delay(10)),
          }),
        );
        const store = new Store();
        tick();
        const res = store.productEntitiesResource();
        // nothing reads the resolved state, so it cannot be derived from the
        // status transitions: a lazy computed would only see the last one
        store.setProductEntitiesLoading();
        tick(10);

        store.setProductEntitiesLoading();
        expect(res.status()).toBe('reloading');
        tick(10);
      });
    }));
  });
});
