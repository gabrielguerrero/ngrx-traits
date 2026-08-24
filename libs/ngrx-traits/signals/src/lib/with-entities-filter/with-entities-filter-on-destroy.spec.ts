import { TestBed } from '@angular/core/testing';
import { signalStore, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { Subject } from 'rxjs';

import {
  withCallStatus,
  withEntitiesHybridFilter,
  withEntitiesLoadingCall,
  withEntitiesRemoteFilter,
} from '../index';
import { Product } from '../test.model';
import { emptyErrorsWhileDestroying } from '../test.utils';

// kept in its own spec file: unhandled rejections left behind by other tests
// land asynchronously and would otherwise pollute the console.error window
// these tests inspect
describe('filter traits promises that never settle', () => {
  const entity = type<Product>();

  it('should not log an unhandled rejection when a remote filter is cut short by destroy', async () => {
    // never emits, so the load stays in flight and the call status never
    // reaches loaded, which is what keeps the filterEntities promise pending
    const apiResponse = new Subject<Product[]>();
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withCallStatus({ initialValue: 'loading' }),
      withEntitiesRemoteFilter({ entity, defaultFilter: { search: '' } }),
      withEntitiesLoadingCall({ fetchEntities: () => apiResponse }),
    );

    const emptyErrors = await emptyErrorsWhileDestroying(() => {
      const store = TestBed.runInInjectionContext(() => new Store());
      // discarded on purpose, as callers routinely do
      store.filterEntities({ filter: { search: 'zelda' } });
      TestBed.resetTestingModule();
    });

    expect(emptyErrors).toEqual([]);
  });

  it('should not log an unhandled rejection when a hybrid filter is cut short by destroy', async () => {
    const apiResponse = new Subject<Product[]>();
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withCallStatus({ initialValue: 'loading' }),
      withEntitiesHybridFilter({
        entity,
        defaultFilter: { search: '', categoryId: 'snes' },
        isRemoteFilter: (previous, current) =>
          previous.categoryId !== current.categoryId,
        filterFn: (entity, filter) =>
          !filter?.search ||
          entity.name.toLowerCase().includes(filter.search.toLowerCase()),
      }),
      withEntitiesLoadingCall({ fetchEntities: () => apiResponse }),
    );

    const emptyErrors = await emptyErrorsWhileDestroying(() => {
      const store = TestBed.runInInjectionContext(() => new Store());
      // a remote filter change, so it waits on the call status rather than
      // resolving locally
      store.filterEntities({
        filter: { search: '', categoryId: 'megadrive' },
      });
      TestBed.resetTestingModule();
    });

    expect(emptyErrors).toEqual([]);
  });
});
