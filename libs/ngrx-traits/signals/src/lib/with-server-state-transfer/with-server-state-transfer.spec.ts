import { makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, type, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { MockedObject } from 'vitest';

import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';
import { withCallStatus } from '../with-call-status/with-call-status';
import { withServerStateTransfer } from './with-server-state-transfer';

describe('withServerStateTransfer', () => {
  const entity = type<Product>();

  describe('Server Side (SSR)', () => {
    let mockTransferState: MockedObject<TransferState>;

    beforeEach(() => {
      mockTransferState = {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        hasKey: vi.fn(),
      } as any;

      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' },
          { provide: TransferState, useValue: mockTransferState },
        ],
      });
    });

    it('should save state to TransferState on server', () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity }),
          withCallStatus(),
          withServerStateTransfer({
            key: 'test-state',
          }),
        );
        const store = new Store();
        TestBed.tick();

        patchState(store, setAllEntities(mockProducts));
        store.setLoaded();
        TestBed.tick();

        const stateKey = makeStateKey('test-state');
        expect(mockTransferState.set).toHaveBeenCalledWith(
          stateKey,
          expect.objectContaining({
            ids: expect.any(Array),
            entityMap: expect.any(Object),
          }),
        );
      });
    });

    it('should save filtered state to TransferState on server', () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity }),
          withCallStatus(),
          withServerStateTransfer({
            key: 'test-state',
            filterState: (state) => ({
              ids: state.ids,
              entityMap: state.entityMap,
            }),
          }),
        );
        const store = new Store();
        TestBed.tick();

        patchState(store, setAllEntities(mockProducts));
        store.setLoaded();
        TestBed.tick();

        const stateKey = makeStateKey('test-state');
        expect(mockTransferState.set).toHaveBeenCalledWith(
          stateKey,
          expect.objectContaining({
            ids: expect.any(Array),
            entityMap: expect.any(Object),
          }),
        );
        // Should not include callStatus properties
        const lastCall = mockTransferState.set.mock.calls[
          mockTransferState.set.mock.calls.length - 1
        ][1] as any;
        expect(lastCall.isLoading).toBeUndefined();
        expect(lastCall.isLoaded).toBeUndefined();
      });
    });

    it('should save state using valueMapper on server', () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withState({
            userProfile: {
              userName: '',
              email: '',
              tempData: null,
            },
          }),
          withServerStateTransfer({
            key: 'test-state',
            valueMapper: (store) => ({
              stateToTransferValue: () => ({
                userName: store.userProfile().userName,
                email: store.userProfile().email,
              }),
              transferValueToState: (savedData) => {
                patchState(store, {
                  userProfile: {
                    ...store.userProfile(),
                    userName: savedData.userName,
                    email: savedData.email,
                  },
                });
              },
            }),
          }),
        );
        const store = new Store();
        TestBed.tick();

        patchState(store, {
          userProfile: {
            userName: 'john',
            email: 'john@example.com',
            tempData: { foo: 'bar' } as any,
          },
        });
        TestBed.tick();

        const stateKey = makeStateKey('test-state');
        expect(mockTransferState.set).toHaveBeenCalledWith(stateKey, {
          userName: 'john',
          email: 'john@example.com',
        });
        // tempData should not be included
        const lastCall = mockTransferState.set.mock.calls[
          mockTransferState.set.mock.calls.length - 1
        ][1] as any;
        expect(lastCall.tempData).toBeUndefined();
      });
    });

    it('should update TransferState on every state change', () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withState({ count: 0 }),
          withServerStateTransfer({
            key: 'test-state',
          }),
        );
        const store = new Store();
        TestBed.tick();

        patchState(store, { count: 1 });
        TestBed.tick();

        patchState(store, { count: 2 });
        TestBed.tick();

        patchState(store, { count: 3 });
        TestBed.tick();

        const stateKey = makeStateKey('test-state');
        expect(mockTransferState.set).toHaveBeenCalledTimes(4); // Initial + 3 updates
        expect(mockTransferState.set).toHaveBeenCalledWith(stateKey, {
          count: 3,
        });
      });
    });
  });

  describe('Client Side (Browser)', () => {
    let mockTransferState: MockedObject<TransferState>;

    beforeEach(() => {
      mockTransferState = {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        hasKey: vi.fn(),
      } as any;

      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'browser' },
          { provide: TransferState, useValue: mockTransferState },
        ],
      });
    });

    it('should restore state from TransferState on client', () => {
      const transferredState = {
        ids: mockProducts.map((p) => p.id),
        entityMap: mockProducts.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
      };
      mockTransferState.get.mockReturnValue(transferredState);

      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity }),
          withServerStateTransfer({
            key: 'test-state',
          }),
        );
        const store = new Store();
        TestBed.tick();

        expect(store.entities()).toEqual(mockProducts);
      });
    });

    it('should remove state from TransferState after restoration', () => {
      const transferredState = {
        ids: mockProducts.map((p) => p.id),
        entityMap: mockProducts.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
      };
      mockTransferState.get.mockReturnValue(transferredState);

      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity }),
          withServerStateTransfer({
            key: 'test-state',
          }),
        );
        new Store();
        TestBed.tick();

        const stateKey = makeStateKey('test-state');
        expect(mockTransferState.remove).toHaveBeenCalledWith(stateKey);
      });
    });

    it('should call onRestore callback after restoration', () => {
      const onRestore = vi.fn();
      const transferredState = {
        ids: mockProducts.map((p) => p.id),
        entityMap: mockProducts.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
      };
      mockTransferState.get.mockReturnValue(transferredState);

      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity }),
          withServerStateTransfer({
            key: 'test-state',
            onRestore,
          }),
        );
        const store = new Store();
        TestBed.tick();

        expect(onRestore).toHaveBeenCalledWith(store);
      });
    });

    it('should restore state using valueMapper on client', () => {
      const transferredState = {
        userName: 'john',
        email: 'john@example.com',
      };
      mockTransferState.get.mockReturnValue(transferredState);

      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withState({
            userProfile: {
              userName: '',
              email: '',
              tempData: null,
            },
          }),
          withServerStateTransfer({
            key: 'test-state',
            valueMapper: (store) => ({
              stateToTransferValue: () => ({
                userName: store.userProfile().userName,
                email: store.userProfile().email,
              }),
              transferValueToState: (savedData) => {
                patchState(store, {
                  userProfile: {
                    ...store.userProfile(),
                    userName: savedData.userName,
                    email: savedData.email,
                  },
                });
              },
            }),
          }),
        );
        const store = new Store();
        TestBed.tick();

        expect(store.userProfile().userName).toBe('john');
        expect(store.userProfile().email).toBe('john@example.com');
        expect(store.userProfile().tempData).toBeNull();
      });
    });

    it('should not restore if no state in TransferState', () => {
      mockTransferState.get.mockReturnValue(null);

      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity }),
          withCallStatus(),
          withServerStateTransfer({
            key: 'test-state',
          }),
        );
        const store = new Store();
        TestBed.tick();

        expect(store.entities()).toEqual([]);
        expect(store.isLoading()).toBe(false);
        expect(mockTransferState.remove).not.toHaveBeenCalled();
      });
    });

    it('should not save state on client', () => {
      mockTransferState.get.mockReturnValue(null);

      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withState({ count: 0 }),
          withServerStateTransfer({
            key: 'test-state',
          }),
        );
        const store = new Store();
        TestBed.tick();

        patchState(store, { count: 1 });
        TestBed.tick();

        patchState(store, { count: 2 });
        TestBed.tick();

        // Should not call set on client
        expect(mockTransferState.set).not.toHaveBeenCalled();
      });
    });
  });
});
