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
          TestBed.flushEffects();
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
            TestBed.flushEffects();
            expect(store.entities()).toEqual([]);
            store.setLoading();
            store.setLoading();
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
            TestBed.flushEffects();
            expect(store.entities()).toEqual([]);
            store.setLoading();
            store.setLoading();
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
            TestBed.flushEffects();
            expect(store.entities()).toEqual([]);
            store.setLoading();
            store.setLoading();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
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
          TestBed.flushEffects();
          expect(store.productEntities()).toEqual([]);
          store.setProductEntitiesLoading();
          tick();
          expect(store.productEntities()).toEqual(mockProducts.slice(0, 30));
        });
      }));
    });
  });
});
