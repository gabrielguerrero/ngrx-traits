/**
 * Tests for the rename-entities-suffix migration (targeted approach)
 */

import { analyzeAll } from '../targeted/store-analyzer';
import { resolveDependencies } from '../targeted/dependency-resolver';
import {
  transformTypeScriptFile,
  transformHtmlFile,
} from '../targeted/targeted-transformer';

// Helper to create mock tree for targeted migration tests
function createMockTree(files: Map<string, string>) {
  return {
    visit: (callback: (path: string) => void) => {
      for (const [path] of files) callback(path);
    },
    read: (path: string) => {
      const content = files.get(path);
      return content ? Buffer.from(content) : null;
    },
    exists: (path: string) => files.has(path),
  };
}

describe('Targeted Migration', () => {
  describe('Store Analyzer', () => {
    it('should detect store with string literal collection', () => {
      const files = new Map<string, string>();
      files.set(
        '/store.ts',
        `
import { signalStore } from '@ngrx/signals';
import { withCallStatus } from '@ngrx-traits/signals';

export const ProductStore = signalStore(
  withCallStatus({ collection: 'product' }),
);
`
      );

      const tree = createMockTree(files);
      const { stores } = analyzeAll(tree as any);

      expect(stores.length).toBe(1);
      expect(stores[0].storeName).toBe('ProductStore');
      expect(stores[0].collections).toContain('product');
    });

    it('should detect store with variable collection reference', () => {
      const files = new Map<string, string>();
      files.set(
        '/store.ts',
        `
import { signalStore } from '@ngrx/signals';
import { withCallStatus } from '@ngrx-traits/signals';

const collection = 'products';

export const ProductStore = signalStore(
  withCallStatus({ collection }),
);
`
      );

      const tree = createMockTree(files);
      const { stores } = analyzeAll(tree as any);

      expect(stores.length).toBe(1);
      expect(stores[0].collections).toContain('products');
    });

    it('should detect store with entityConfig spread', () => {
      const files = new Map<string, string>();
      files.set(
        '/store.ts',
        `
import { signalStore } from '@ngrx/signals';
import { withCallStatus, entityConfig } from '@ngrx-traits/signals';

const productEntityConfig = entityConfig({ collection: 'product' });

export const ProductStore = signalStore(
  withCallStatus({ ...productEntityConfig }),
);
`
      );

      const tree = createMockTree(files);
      const { stores } = analyzeAll(tree as any);

      expect(stores.length).toBe(1);
      expect(stores[0].collections).toContain('product');
    });

    it('should detect store with direct entityConfig variable', () => {
      const files = new Map<string, string>();
      files.set(
        '/store.ts',
        `
import { signalStore } from '@ngrx/signals';
import { withCallStatus, entityConfig } from '@ngrx-traits/signals';

const productEntityConfig = entityConfig({ collection: 'product' });

export const ProductStore = signalStore(
  withCallStatus(productEntityConfig),
);
`
      );

      const tree = createMockTree(files);
      const { stores } = analyzeAll(tree as any);

      expect(stores.length).toBe(1);
      expect(stores[0].collections).toContain('product');
    });

    it('should detect multiple collections in same store', () => {
      const files = new Map<string, string>();
      files.set(
        '/store.ts',
        `
import { signalStore } from '@ngrx/signals';
import { withCallStatus, withEntitiesLocalFilter } from '@ngrx-traits/signals';

export const ShopStore = signalStore(
  withCallStatus({ collection: 'product' }),
  withEntitiesLocalFilter({ collection: 'order' }),
);
`
      );

      const tree = createMockTree(files);
      const { stores } = analyzeAll(tree as any);

      expect(stores.length).toBe(1);
      expect(stores[0].collections).toContain('product');
      expect(stores[0].collections).toContain('order');
    });
  });

  describe('Custom signalStoreFeature detection', () => {
    it('should detect custom feature with collection', () => {
      const files = new Map<string, string>();
      files.set(
        '/feature.ts',
        `
import { signalStoreFeature } from '@ngrx/signals';
import { withCallStatus } from '@ngrx-traits/signals';

export function withJobEntities() {
  return signalStoreFeature(
    withCallStatus({ collection: 'job' }),
  );
}
`
      );

      const tree = createMockTree(files);
      const { customFeatures } = analyzeAll(tree as any);

      expect(customFeatures.length).toBe(1);
      expect(customFeatures[0].functionName).toBe('withJobEntities');
      expect(customFeatures[0].collections).toContain('job');
    });

    it('should detect custom feature with entityConfig', () => {
      const files = new Map<string, string>();
      files.set(
        '/feature.ts',
        `
import { signalStoreFeature } from '@ngrx/signals';
import { withCallStatus, entityConfig } from '@ngrx-traits/signals';

const jobEntityConfig = entityConfig({ collection: 'job' });

export function withJobEntities() {
  return signalStoreFeature(
    withCallStatus({ ...jobEntityConfig }),
  );
}
`
      );

      const tree = createMockTree(files);
      const { customFeatures } = analyzeAll(tree as any);

      expect(customFeatures.length).toBe(1);
      expect(customFeatures[0].collections).toContain('job');
    });

    it('should inherit collections from custom feature in store', () => {
      const files = new Map<string, string>();
      files.set(
        '/feature.ts',
        `
import { signalStoreFeature } from '@ngrx/signals';
import { withCallStatus } from '@ngrx-traits/signals';

export function withJobEntities() {
  return signalStoreFeature(
    withCallStatus({ collection: 'job' }),
  );
}
`
      );
      files.set(
        '/store.ts',
        `
import { signalStore } from '@ngrx/signals';
import { withJobEntities } from './feature';
import { withCallStatus } from '@ngrx-traits/signals';

export const MyStore = signalStore(
  withCallStatus({ collection: 'product' }),
  withJobEntities(),
);
`
      );

      const tree = createMockTree(files);
      const { stores, customFeatures } = analyzeAll(tree as any);

      expect(customFeatures.length).toBe(1);
      expect(stores.length).toBe(1);
      expect(stores[0].collections).toContain('product');
      expect(stores[0].collections).toContain('job');
    });

    it('should detect custom feature inside withFeature wrapper', () => {
      const files = new Map<string, string>();
      files.set(
        '/feature.ts',
        `
import { signalStoreFeature } from '@ngrx/signals';
import { withCallStatus } from '@ngrx-traits/signals';

export function withJobEntities() {
  return signalStoreFeature(
    withCallStatus({ collection: 'job' }),
  );
}
`
      );
      files.set(
        '/store.ts',
        `
import { signalStore, withFeature } from '@ngrx/signals';
import { withJobEntities } from './feature';

export const JobStore = signalStore(
  withFeature((store) => withJobEntities()),
);
`
      );

      const tree = createMockTree(files);
      const { stores } = analyzeAll(tree as any);

      expect(stores.length).toBe(1);
      expect(stores[0].collections).toContain('job');
    });

    it('should detect custom feature inside withFeature with block body', () => {
      const files = new Map<string, string>();
      files.set(
        '/feature.ts',
        `
import { signalStoreFeature } from '@ngrx/signals';
import { withCallStatus } from '@ngrx-traits/signals';

export function withJobEntities() {
  return signalStoreFeature(
    withCallStatus({ collection: 'job' }),
  );
}
`
      );
      files.set(
        '/store.ts',
        `
import { signalStore, withFeature } from '@ngrx/signals';
import { withJobEntities } from './feature';

export const JobStore = signalStore(
  withFeature((store) => {
    return withJobEntities();
  }),
);
`
      );

      const tree = createMockTree(files);
      const { stores } = analyzeAll(tree as any);

      expect(stores.length).toBe(1);
      expect(stores[0].collections).toContain('job');
    });
  });

  describe('Variable-based signalStoreFeature detection', () => {
    it('should detect variable holding signalStoreFeature', () => {
      const files = new Map<string, string>();
      files.set(
        '/store.ts',
        `
import { signalStore, signalStoreFeature } from '@ngrx/signals';
import { withCallStatus } from '@ngrx-traits/signals';

const productsStoreFeature = signalStoreFeature(
  withCallStatus({ collection: 'product' }),
);

export const ProductStore = signalStore(productsStoreFeature);
`
      );

      const tree = createMockTree(files);
      const { stores, customFeatures } = analyzeAll(tree as any);

      expect(customFeatures.length).toBe(1);
      expect(customFeatures[0].functionName).toBe('productsStoreFeature');
      expect(customFeatures[0].collections).toContain('product');
      expect(stores.length).toBe(1);
      expect(stores[0].collections).toContain('product');
    });

    it('should detect inline signalStoreFeature inside signalStore', () => {
      const files = new Map<string, string>();
      files.set(
        '/store.ts',
        `
import { signalStore, signalStoreFeature } from '@ngrx/signals';
import { withCallStatus, withEntitiesLocalSort } from '@ngrx-traits/signals';

export const ShopStore = signalStore(
  signalStoreFeature(
    withCallStatus({ collection: 'product' }),
  ),
  signalStoreFeature(
    withEntitiesLocalSort({ collection: 'orderItem' }),
  ),
);
`
      );

      const tree = createMockTree(files);
      const { stores } = analyzeAll(tree as any);

      expect(stores.length).toBe(1);
      expect(stores[0].collections).toContain('product');
      expect(stores[0].collections).toContain('orderItem');
    });

    it('should detect mixed variable and inline signalStoreFeature', () => {
      const files = new Map<string, string>();
      files.set(
        '/store.ts',
        `
import { signalStore, signalStoreFeature } from '@ngrx/signals';
import { withCallStatus, withEntitiesLocalSort } from '@ngrx-traits/signals';

const productsStoreFeature = signalStoreFeature(
  withCallStatus({ collection: 'product' }),
);

export const ShopStore = signalStore(
  productsStoreFeature,
  signalStoreFeature(
    withEntitiesLocalSort({ collection: 'orderItem' }),
  ),
);
`
      );

      const tree = createMockTree(files);
      const { stores } = analyzeAll(tree as any);

      expect(stores.length).toBe(1);
      expect(stores[0].collections).toContain('product');
      expect(stores[0].collections).toContain('orderItem');
    });
  });

  describe('Dependency Resolution', () => {
    it('should find consumer files that use the store', () => {
      const files = new Map<string, string>();
      files.set(
        '/store.ts',
        `
import { signalStore } from '@ngrx/signals';
import { withCallStatus } from '@ngrx-traits/signals';

export const ProductStore = signalStore(
  withCallStatus({ collection: 'product' }),
);
`
      );
      files.set(
        '/component.ts',
        `
import { ProductStore } from './store';

export class MyComponent {
  store = inject(ProductStore);
}
`
      );

      const tree = createMockTree(files);
      const { stores, customFeatures } = analyzeAll(tree as any);
      const scope = resolveDependencies(tree as any, stores, customFeatures);

      expect(scope.allFiles.has('/store.ts')).toBe(true);
      expect(scope.allFiles.has('/component.ts')).toBe(true);
    });

    it('should include custom feature files in scope', () => {
      const files = new Map<string, string>();
      files.set(
        '/feature.ts',
        `
import { signalStoreFeature } from '@ngrx/signals';
import { withCallStatus } from '@ngrx-traits/signals';

export function withJobEntities() {
  return signalStoreFeature(
    withCallStatus({ collection: 'job' }),
  );
}
`
      );
      files.set(
        '/store.ts',
        `
import { signalStore } from '@ngrx/signals';
import { withJobEntities } from './feature';

export const JobStore = signalStore(withJobEntities());
`
      );

      const tree = createMockTree(files);
      const { stores, customFeatures } = analyzeAll(tree as any);
      const scope = resolveDependencies(tree as any, stores, customFeatures);

      expect(scope.allFiles.has('/feature.ts')).toBe(true);
      expect(scope.allFiles.has('/store.ts')).toBe(true);
      expect(scope.collections.has('job')).toBe(true);
    });
  });

  describe('Targeted Transformation', () => {
    it('should transform identifiers but not strings', () => {
      const collections = new Set(['product']);
      const input = `
const comment = 'productCallStatus is the status';
const status = productCallStatus;
`;

      const result = transformTypeScriptFile(input, '/test.ts', collections);

      expect(result.modified).toBe(true);
      expect(result.content).toContain("'productCallStatus is the status'");
      expect(result.content).toContain('productEntitiesCallStatus');
    });

    it('should transform inline templates in @Component', () => {
      const collections = new Set(['product']);
      const input = `
@Component({
  template: \`
    <div>{{ store.isProductLoading() }}</div>
    <span>{{ store.productCallStatus() }}</span>
  \`
})
export class MyComponent {}
`;

      const result = transformTypeScriptFile(input, '/component.ts', collections);

      expect(result.modified).toBe(true);
      expect(result.content).toContain('isProductEntitiesLoading');
      expect(result.content).toContain('productEntitiesCallStatus');
    });

    it('should transform HTML files', () => {
      const collections = new Set(['product']);
      const input = `
<div *ngIf="store.isProductLoading()">Loading...</div>
<button (click)="store.loadProductPage(1)">Load</button>
`;

      const result = transformHtmlFile(input, collections);

      expect(result.modified).toBe(true);
      expect(result.content).toContain('isProductEntitiesLoading');
      expect(result.content).toContain('loadProductEntitiesPage');
    });

    it('should only transform properties for specified collections', () => {
      const collections = new Set(['product']);
      const input = `
const productStatus = productCallStatus;
const orderStatus = orderCallStatus;
`;

      const result = transformTypeScriptFile(input, '/test.ts', collections);

      expect(result.content).toContain('productEntitiesCallStatus');
      expect(result.content).toContain('orderCallStatus');
      expect(result.content).not.toContain('orderEntitiesCallStatus');
    });

    it('should transform selection patterns', () => {
      const collections = new Set(['product']);
      const input = `
const allSelected = isAllProductSelected();
clearProductSelection();
`;

      const result = transformTypeScriptFile(input, '/test.ts', collections);

      expect(result.modified).toBe(true);
      expect(result.content).toContain('isAllProductEntitiesSelected');
      expect(result.content).toContain('clearProductEntitiesSelection');
    });

    it('should transform all CallStatus patterns', () => {
      const collections = new Set(['product']);
      const input = `
productCallStatus;
productError;
isProductLoading;
isProductLoaded;
setProductLoading;
setProductLoaded;
setProductError;
`;

      const result = transformTypeScriptFile(input, '/test.ts', collections);

      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesCallStatus');
      expect(result.content).toContain('productEntitiesError');
      expect(result.content).toContain('isProductEntitiesLoading');
      expect(result.content).toContain('isProductEntitiesLoaded');
      expect(result.content).toContain('setProductEntitiesLoading');
      expect(result.content).toContain('setProductEntitiesLoaded');
      expect(result.content).toContain('setProductEntitiesError');
    });

    it('should transform all Pagination patterns', () => {
      const collections = new Set(['product']);
      const input = `
productPagination;
productCurrentPage;
productPagedRequest;
loadProductPage;
setProductPagedResult;
loadMoreProduct;
loadProductNextPage;
loadProductPreviousPage;
loadProductFirstPage;
`;

      const result = transformTypeScriptFile(input, '/test.ts', collections);

      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesPagination');
      expect(result.content).toContain('productEntitiesCurrentPage');
      expect(result.content).toContain('productEntitiesPagedRequest');
      expect(result.content).toContain('loadProductEntitiesPage');
      expect(result.content).toContain('setProductEntitiesPagedResult');
      expect(result.content).toContain('loadMoreProductEntities');
      expect(result.content).toContain('loadProductEntitiesNextPage');
      expect(result.content).toContain('loadProductEntitiesPreviousPage');
      expect(result.content).toContain('loadProductEntitiesFirstPage');
    });

    it('should transform all Filter patterns', () => {
      const collections = new Set(['product']);
      const input = `
productFilter;
isProductFilterChanged;
resetProductFilter;
`;

      const result = transformTypeScriptFile(input, '/test.ts', collections);

      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesFilter');
      expect(result.content).toContain('isProductEntitiesFilterChanged');
      expect(result.content).toContain('resetProductEntitiesFilter');
    });

    it('should transform all Sort patterns', () => {
      const collections = new Set(['product']);
      const input = `
productSort;
sortProduct;
`;

      const result = transformTypeScriptFile(input, '/test.ts', collections);

      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesSort');
      expect(result.content).toContain('sortProductEntities');
    });
  });

  describe('Full Migration Flow', () => {
    it('should migrate store and consumer with custom feature', () => {
      const files = new Map<string, string>();
      files.set(
        '/feature.ts',
        `
import { signalStoreFeature } from '@ngrx/signals';
import { withCallStatus } from '@ngrx-traits/signals';

export function withJobEntities() {
  return signalStoreFeature(
    withCallStatus({ collection: 'job' }),
  );
}
`
      );
      files.set(
        '/store.ts',
        `
import { signalStore } from '@ngrx/signals';
import { withJobEntities } from './feature';

export const JobStore = signalStore(withJobEntities());
`
      );
      files.set(
        '/component.ts',
        `
import { JobStore } from './store';

export class JobComponent {
  store = inject(JobStore);
  isLoading = this.store.isJobLoading;
  status = this.store.jobCallStatus;
}
`
      );

      const tree = createMockTree(files);
      const { stores, customFeatures } = analyzeAll(tree as any);
      const scope = resolveDependencies(tree as any, stores, customFeatures);

      const componentContent = files.get('/component.ts')!;
      const result = transformTypeScriptFile(
        componentContent,
        '/component.ts',
        scope.collections
      );

      expect(result.modified).toBe(true);
      expect(result.content).toContain('isJobEntitiesLoading');
      expect(result.content).toContain('jobEntitiesCallStatus');
    });
  });
});
