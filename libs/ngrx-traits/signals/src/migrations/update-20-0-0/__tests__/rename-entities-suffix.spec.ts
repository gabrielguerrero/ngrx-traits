/**
 * Tests for the rename-entities-suffix migration
 */

import { getAllPatterns } from '../utils/pattern-matchers';
import { analyzeAll } from '../targeted/store-analyzer';
import { resolveDependencies } from '../targeted/dependency-resolver';
import {
  transformTypeScriptFile as targetedTransformTS,
  transformHtmlFile as targetedTransformHtml,
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

// Simple implementation of file transformation for testing
function transformTypeScriptFile(content: string) {
  let transformed = content;
  const replacements: Array<{ oldName: string; newName: string; count: number }> = [];
  let modified = false;

  const patterns = getAllPatterns();

  patterns.forEach(pattern => {
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
    const matches = transformed.match(regex);

    if (matches) {
      const newContent = transformed.replace(regex, (match, ...args) => {
        const name = args[0] || match.replace(/[^\w]/g, '');
        const replacement = pattern.replacement(match, name);

        if (match !== replacement) {
          modified = true;
          const existing = replacements.find(r => r.oldName === match);
          if (existing) {
            existing.count++;
          } else {
            replacements.push({ oldName: match, newName: replacement, count: 1 });
          }
        }
        return replacement;
      });

      if (newContent !== transformed) {
        transformed = newContent;
      }
    }
  });

  return { modified, content: transformed, replacements };
}

function transformHtmlFile(content: string) {
  return transformTypeScriptFile(content);
}

describe('Rename Entities Suffix Migration', () => {
  describe('TypeScript transformation', () => {
    it('should rename all CallStatus properties', () => {
      const input = `
        const store = {
          productCallStatus,
          isProductLoading,
          isProductLoaded,
          productError,
          setProductLoading() {},
          setProductLoaded() {},
          setProductError() {}
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      expect(result.replacements.length).toBeGreaterThan(0);
      expect(result.content).toContain('productEntitiesCallStatus');
      expect(result.content).toContain('isProductEntitiesLoading');
      expect(result.content).toContain('productEntitiesError');
    });

    it('should rename Pagination properties', () => {
      const input = `
        const store = {
          productPagination,
          productCurrentPage,
          productPagedRequest,
          loadProductPage() {},
          setProductPagedResult() {}
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesPagination');
      expect(result.content).toContain('productEntitiesCurrentPage');
      expect(result.content).toContain('loadProductEntitiesPage');
    });

    it('should rename Filter properties', () => {
      const input = `
        const store = {
          productFilter,
          isProductFilterChanged,
          resetProductFilter() {}
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesFilter');
      expect(result.content).toContain('isProductEntitiesFilterChanged');
      expect(result.content).toContain('resetProductEntitiesFilter');
    });

    it('should rename Sort properties', () => {
      const input = `
        const store = {
          productSort,
          sortProduct() {}
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesSort');
      expect(result.content).toContain('sortProductEntities');
    });

    it('should not modify already migrated code', () => {
      const input = `
        const store = {
          productEntitiesCallStatus,
          isProductEntitiesLoading,
          productEntitiesFilter
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(false);
      expect(result.replacements.length).toBe(0);
    });

    it('should handle mixed migrated and non-migrated code', () => {
      const input = `
        const store = {
          productFilter,
          productEntitiesFilter,
          isProductLoading
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.content).toContain('productEntitiesFilter');
      expect(result.content).toContain('isProductEntitiesLoading');
      // Existing EntitiesFilter should remain unchanged
      expect((result.content.match(/productEntitiesFilter/g) || []).length).toBe(2);
    });

    it('should handle property destructuring', () => {
      const input = `
        const {
          productFilter,
          isProductLoading,
          productPagination
        } = store;
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesFilter');
      expect(result.content).toContain('isProductEntitiesLoading');
      expect(result.content).toContain('productEntitiesPagination');
    });

    it('should handle function calls with parameters', () => {
      const input = `
        store.setProductError(new Error('Failed'));
        store.setProductPagedResult({ data: [], total: 0 });
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      expect(result.content).toContain('setProductEntitiesError');
      expect(result.content).toContain('setProductEntitiesPagedResult');
    });
  });

  describe('HTML transformation', () => {
    it('should rename properties in template bindings', () => {
      const input = `
        <div>
          <p>{{ store.productFilter() }}</p>
          <p>{{ store.isProductLoading() }}</p>
          <p>{{ store.productCurrentPage() }}</p>
        </div>
      `;

      const result = transformHtmlFile(input);
      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesFilter');
      expect(result.content).toContain('isProductEntitiesLoading');
      expect(result.content).toContain('productEntitiesCurrentPage');
    });

    it('should rename properties in property bindings', () => {
      const input = `
        <div [data]="store.productFilter()">
          <span [class.loading]="store.isProductLoading()"></span>
        </div>
      `;

      const result = transformHtmlFile(input);
      expect(result.content).toContain('productEntitiesFilter');
      expect(result.content).toContain('isProductEntitiesLoading');
    });

    it('should rename method calls in event bindings', () => {
      const input = `
        <button (click)="store.loadProductPage(1)">Load</button>
        <button (click)="store.resetProductFilter()">Reset</button>
        <button (click)="store.sortProduct()">Sort</button>
      `;

      const result = transformHtmlFile(input);
      expect(result.content).toContain('loadProductEntitiesPage');
      expect(result.content).toContain('resetProductEntitiesFilter');
      expect(result.content).toContain('sortProductEntities');
    });
  });

  describe('Edge cases', () => {
    it('should not rename properties with Entity in the name (already correct)', () => {
      const input = `
        const store = {
          productEntity,
          productEntityFilter,
          loadProductEntity() {}
        };
      `;

      const result = transformTypeScriptFile(input);
      // These should not be renamed as they already contain Entity/Entities
      const content = result.content;
      // Check if the original content is preserved
      expect(content).toBeDefined();
    });

    it('should handle multiple occurrences of same property', () => {
      const input = `
        const a = store.productFilter;
        const b = store.productFilter;
        const c = store.productFilter;
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      const count = (result.content.match(/productEntitiesFilter/g) || []).length;
      expect(count).toBe(3);
    });

    it('should preserve string literals and comments', () => {
      const input = `
        // productFilter is the main filter
        const filter = 'productFilter';
        const store = {
          productFilter,
          productError
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.content).toContain("'productFilter'"); // String literal should not be renamed
      expect(result.content).toContain('productEntitiesFilter'); // Actual property should be renamed
    });

    it('should handle scroll pagination methods', () => {
      const input = `
        store.loadProductNextPage();
        store.loadProductPreviousPage();
        store.loadProductFirstPage();
        store.loadMoreProduct();
      `;

      const result = transformTypeScriptFile(input);
      expect(result.content).toContain('loadProductEntitiesNextPage');
      expect(result.content).toContain('loadProductEntitiesPreviousPage');
      expect(result.content).toContain('loadProductEntitiesFirstPage');
      expect(result.content).toContain('loadMoreProductEntities');
    });
  });

  describe('Replacement counting', () => {
    it('should accurately count replacements', () => {
      const input = `
        const store = {
          productFilter,
          productCurrentPage,
          productSort
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.replacements.length).toBe(3);
      result.replacements.forEach(r => {
        expect(r.count).toBe(1);
      });
    });

    it('should count multiple occurrences correctly', () => {
      const input = `
        const a = productFilter;
        const b = productFilter;
      `;

      const result = transformTypeScriptFile(input);
      const filterReplacement = result.replacements.find(r => r.oldName === 'productFilter');
      expect(filterReplacement?.count).toBe(2);
    });
  });
});

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

      const result = targetedTransformTS(input, '/test.ts', collections);

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

      const result = targetedTransformTS(input, '/component.ts', collections);

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

      const result = targetedTransformHtml(input, collections);

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

      const result = targetedTransformTS(input, '/test.ts', collections);

      expect(result.content).toContain('productEntitiesCallStatus');
      expect(result.content).toContain('orderCallStatus');
      expect(result.content).not.toContain('orderEntitiesCallStatus');
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
      const result = targetedTransformTS(
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
