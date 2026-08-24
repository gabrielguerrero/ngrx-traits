import { TestBed } from '@angular/core/testing';
import { signalStore, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { Subject } from 'rxjs';

import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';
import { emptyErrorsWhileDestroying } from '../test.utils';
import { withEntitiesCalls } from './with-entities-calls';

// kept in its own spec file: unhandled rejections left behind by other tests
// land asynchronously and would otherwise pollute the console.error window
// this test inspects
describe('withEntitiesCalls promises that never settle', () => {
  const entity = type<Product>();

  it('should not log an unhandled rejection when a call is cut short by destroy', async () => {
    const apiResponse = new Subject<Partial<Product>>();
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withEntitiesCalls({
        entity,
        calls: () => ({
          loadDetail: ({ entity }: { entity: Product }) => apiResponse,
        }),
      }),
    );

    const emptyErrors = await emptyErrorsWhileDestroying(() => {
      const store = TestBed.runInInjectionContext(() => new Store());
      // discarded on purpose: the promise is still in flight when the store is
      // destroyed, so it never settles
      store.loadDetail({ entity: mockProducts[0] });
      expect(store.isLoadDetailLoading(mockProducts[0].id)).toBeTruthy();
      TestBed.resetTestingModule();
    });

    expect(emptyErrors).toEqual([]);
  });
});
