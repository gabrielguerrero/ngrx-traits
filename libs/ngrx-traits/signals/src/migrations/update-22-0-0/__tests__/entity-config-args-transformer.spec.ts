/**
 * Tests for the (entityConfig, options) call form migration
 */
import { transformEntityConfigArgs } from '../entity-config-args-transformer';

const imports = `import {
  withCallStatus,
  withEntitiesCalls,
  withEntitiesLoadingCall,
  withEntitiesLocalFilter,
  withEntitiesLocalPagination,
  withEntitiesLocalSort,
  withEntitiesRemoteFilter,
  withEntitiesSingleSelection,
  withEntitiesSyncToRouteQueryParams,
} from '@ngrx-traits/signals';
`;

function migrate(code: string) {
  return transformEntityConfigArgs(imports + code);
}

function migrated(code: string) {
  return migrate(code).content.slice(imports.length);
}

describe('transformEntityConfigArgs', () => {
  it('moves a spread entityConfig to the first arg', () => {
    expect(
      migrated(`withEntitiesLocalPagination({
    ...productsEntityConfig,
    pageSize: 5,
  })`),
    ).toBe(`withEntitiesLocalPagination(productsEntityConfig, {
    pageSize: 5,
  })`);
  });

  it('migrates withCallStatus with a spread entityConfig', () => {
    expect(
      migrated(
        `withCallStatus({ ...productsEntityConfig, initialValue: 'loading' })`,
      ),
    ).toBe(`withCallStatus(productsEntityConfig, { initialValue: 'loading' })`);
  });

  it('drops the object when it only had the spread', () => {
    expect(
      migrated(`withEntitiesSyncToRouteQueryParams({
      ...productEntityConfig,
    })`),
    ).toBe(`withEntitiesSyncToRouteQueryParams(productEntityConfig)`);
  });

  it('keeps comments and formatting of the options', () => {
    expect(
      migrated(`withEntitiesLocalFilter({
    ...productsEntityConfig,
    // the default
    defaultFilter: { search: '' },
    filterFn: (entity, filter) => entity.name.includes(filter.search),
  })`),
    ).toBe(`withEntitiesLocalFilter(productsEntityConfig, {
    // the default
    defaultFilter: { search: '' },
    filterFn: (entity, filter) => entity.name.includes(filter.search),
  })`);
  });

  it('splits an inline entity and collection from the options', () => {
    expect(
      migrated(`withEntitiesLocalSort({
    entity,
    collection: 'products',
    selectId: (p) => p.code,
    defaultSort: { field: 'name', direction: 'asc' },
  })`),
    )
      .toBe(`withEntitiesLocalSort({ entity, collection: 'products', selectId: (p) => p.code }, {
    defaultSort: { field: 'name', direction: 'asc' },
  })`);
  });

  it('splits identity props declared after the options', () => {
    expect(
      migrated(
        `withEntitiesLocalPagination({ pageSize: 10, entity, collection })`,
      ),
    ).toBe(
      `withEntitiesLocalPagination({ entity, collection }, { pageSize: 10 })`,
    );
  });

  it('moves the calls factory to the second arg of withEntitiesCalls', () => {
    expect(
      migrated(`withEntitiesCalls({
    ...productsEntityConfig,
    calls: (store) => ({ loadProduct: (id: string) => load(id) }),
  })`),
    ).toBe(
      `withEntitiesCalls(productsEntityConfig, (store) => ({ loadProduct: (id: string) => load(id) }))`,
    );
  });

  it('moves a store independent spread out of a factory config', () => {
    expect(
      migrated(`withEntitiesLoadingCall(
    ({ productEntitiesFilter }, service = inject(ProductService)) => ({
      ...productEntityConfig,
      fetchEntities: () => service.getProducts(productEntitiesFilter()),
    }),
  )`),
    ).toBe(`withEntitiesLoadingCall(
    productEntityConfig, ({ productEntitiesFilter }, service = inject(ProductService)) => ({
      fetchEntities: () => service.getProducts(productEntitiesFilter()),
    }),
  )`);
  });

  it('skips a factory spread that reads the store', () => {
    const result = migrate(`withEntitiesLoadingCall((store) => ({
    ...store.config,
    fetchEntities: () => load(),
  }))`);
    expect(result.modified).toBe(false);
    expect(result.skipped).toHaveLength(1);
  });

  it('honours import aliases', () => {
    const result =
      transformEntityConfigArgs(`import { withEntitiesLocalPagination as paginate } from '@ngrx-traits/signals';
paginate({ ...cfg, pageSize: 5 })`);
    expect(result.content).toContain(`paginate(cfg, { pageSize: 5 })`);
  });

  it('migrates feature calls nested in another feature options', () => {
    expect(
      migrated(`withEntitiesLoadingCall({
    ...a,
    fetchEntities: () => signalStoreFeature(withCallStatus({ ...b, initialValue: 'loading' })),
  })`),
    ).toBe(`withEntitiesLoadingCall(a, {
    fetchEntities: () => signalStoreFeature(withCallStatus(b, { initialValue: 'loading' })),
  })`);
  });

  describe('leaves untouched', () => {
    it.each([
      ['two arg calls', `withEntitiesLocalPagination(cfg, { pageSize: 5 })`],
      [
        'entityConfig only',
        `withEntitiesSingleSelection(productsEntityConfig)`,
      ],
      [
        'inline identity only',
        `withEntitiesSingleSelection({ entity, collection })`,
      ],
      [
        'anonymous collection',
        `withEntitiesLocalPagination({ entity, pageSize: 5 })`,
      ],
      [
        'withCallStatus prop',
        `withCallStatus({ prop: 'orders', initialValue: 'loading' })`,
      ],
      [
        'withCallStatus collection without entity',
        `withCallStatus({ collection: 'orders', initialValue: 'loading' })`,
      ],
      [
        'no entity',
        `withEntitiesLoadingCall({ collection, fetchEntities: () => load() })`,
      ],
      [
        'withCallStatus without args',
        `withCallStatus({ initialValue: 'loading' })`,
      ],
    ])('%s', (_, code) => {
      const result = migrate(code);
      expect(result.modified).toBe(false);
      expect(result.skipped).toHaveLength(0);
    });

    it('features not imported from @ngrx-traits/signals', () => {
      const code = `import { withCallStatus } from './my-features';
import { withEntitiesLocalSort } from '@ngrx-traits/signals';
withCallStatus({ ...cfg, initialValue: 'loading' })`;
      expect(transformEntityConfigArgs(code).modified).toBe(false);
    });
  });

  describe('warns and skips', () => {
    it.each([
      [
        'more than one spread',
        `withEntitiesLocalPagination({ ...a, ...b, pageSize: 5 })`,
      ],
      [
        'spread with identity props',
        `withEntitiesLocalPagination({ ...a, collection: 'x', pageSize: 5 })`,
      ],
      [
        'options before the spread',
        `withEntitiesLocalPagination({ pageSize: 5, ...a })`,
      ],
      [
        'selectId not accepted by the feature',
        `withEntitiesRemoteFilter({ entity, collection, selectId, defaultFilter })`,
      ],
      [
        'withEntitiesCalls with extra options',
        `withEntitiesCalls({ ...a, calls, other: 1 })`,
      ],
      [
        'spread of a local non entityConfig',
        `const callCfg = { prop: 'orders' } as const;
withCallStatus({ ...callCfg, initialValue: 'loading' })`,
      ],
      [
        'spread of a local config carrying options',
        `const base = { ...cfg, filterFn };
withEntitiesLocalFilter({ ...base, defaultFilter })`,
      ],
      [
        'spread of an expression',
        `withEntitiesLocalPagination({ ...(flag ? a : b), pageSize: 5 })`,
      ],
      [
        'factory spread of a config declared after the call',
        `const Store = signalStore(
  withEntitiesLoadingCall(() => ({ ...laterCfg, fetchEntities })),
);
const laterCfg = entityConfig({ entity, collection: 'products' });`,
      ],
      [
        'factory spread shadowed by a destructured param',
        `withEntitiesLoadingCall(({ cfg }) => ({ ...cfg, fetchEntities }))`,
      ],
      [
        'factory config of withEntitiesSyncToRouteQueryParams',
        `withEntitiesSyncToRouteQueryParams(() => ({ ...cfg, prefix: 'p' }))`,
      ],
      [
        'factory config of withEntitiesCalls',
        `withEntitiesCalls(() => ({ ...cfg, calls }))`,
      ],
      [
        'namespace import',
        `import * as traits from '@ngrx-traits/signals';
traits.withEntitiesLocalPagination({ ...cfg, pageSize: 5 })`,
      ],
    ])('%s', (_, code) => {
      const result = migrate(code);
      expect(result.modified).toBe(false);
      expect(result.skipped).toHaveLength(1);
    });
  });

  describe('comments and commas', () => {
    it('drops a comment before the removed spread comma', () => {
      expect(
        migrated(
          `withEntitiesLocalPagination({ ...cfg /* cfg */, pageSize: 5 })`,
        ),
      ).toBe(`withEntitiesLocalPagination(cfg, { pageSize: 5 })`);
    });

    it('drops a comment before a removed identity prop comma', () => {
      expect(
        migrated(
          `withEntitiesLocalSort({ entity, collection: 'products' /* c */, defaultSort })`,
        ),
      ).toBe(
        `withEntitiesLocalSort({ entity, collection: 'products' }, { defaultSort })`,
      );
    });

    it('keeps the comment of the last kept option', () => {
      expect(
        migrated(
          `withEntitiesLocalPagination({ pageSize: 5 /* size */, entity, collection })`,
        ),
      ).toBe(
        `withEntitiesLocalPagination({ entity, collection }, { pageSize: 5 /* size */ })`,
      );
    });

    it('keeps a trailing comma after removed trailing identity props', () => {
      expect(
        migrated(
          `withEntitiesLocalPagination({ pageSize: 5, entity, collection, })`,
        ),
      ).toBe(
        `withEntitiesLocalPagination({ entity, collection }, { pageSize: 5, })`,
      );
    });

    it('handles a comment before the comma in a factory', () => {
      expect(
        migrated(
          `withEntitiesLoadingCall(() => ({ ...cfg /* cfg */, fetchEntities }))`,
        ),
      ).toBe(`withEntitiesLoadingCall(cfg, () => ({ fetchEntities }))`);
    });
  });

  describe('factory forms', () => {
    it('migrates a function expression factory', () => {
      expect(
        migrated(
          `withEntitiesLoadingCall(function (store) { return { ...cfg, fetchEntities }; })`,
        ),
      ).toBe(
        `withEntitiesLoadingCall(cfg, function (store) { return { fetchEntities }; })`,
      );
    });

    it('migrates a block body factory with a lone return', () => {
      expect(
        migrated(
          `withEntitiesLocalPagination((store) => { return { ...cfg, pageSize: 5 }; })`,
        ),
      ).toBe(
        `withEntitiesLocalPagination(cfg, (store) => { return { pageSize: 5 }; })`,
      );
    });

    it('leaves a block body factory with more statements', () => {
      const result = migrate(`withEntitiesLocalPagination((store) => {
  const cfg = store.cfg;
  return { ...cfg, pageSize: 5 };
})`);
      expect(result.modified).toBe(false);
    });

    it('migrates a property access spread', () => {
      expect(
        migrated(
          `withEntitiesLoadingCall(() => ({ ...configs.product, fetchEntities }))`,
        ),
      ).toBe(
        `withEntitiesLoadingCall(configs.product, () => ({ fetchEntities }))`,
      );
    });

    it('leaves the object empty when the factory only spread the config', () => {
      expect(migrated(`withEntitiesLocalPagination(() => ({ ...cfg }))`)).toBe(
        `withEntitiesLocalPagination(cfg, () => ({}))`,
      );
    });

    it('migrates a nested call inside a factory', () => {
      expect(
        migrated(`withEntitiesLoadingCall(() => ({
    ...a,
    fetchEntities: () => withCallStatus({ ...b, initialValue: 'loading' }),
  }))`),
      ).toBe(`withEntitiesLoadingCall(a, () => ({
    fetchEntities: () => withCallStatus(b, { initialValue: 'loading' }),
  }))`);
    });
  });

  describe('spread entityConfig checks', () => {
    it('migrates a local entityConfig(...) spread', () => {
      expect(
        migrated(`const cfg = entityConfig({ entity, collection: 'products' });
withEntitiesLocalPagination({ ...cfg, pageSize: 5 })`),
      ).toContain(`withEntitiesLocalPagination(cfg, { pageSize: 5 })`);
    });

    it('migrates a local object literal entityConfig spread', () => {
      expect(
        migrated(`const cfg = { entity: type<Product>(), collection: 'products' } as const;
withEntitiesLocalPagination({ ...cfg, pageSize: 5 })`),
      ).toContain(`withEntitiesLocalPagination(cfg, { pageSize: 5 })`);
    });

    it('migrates a factory spread of a config declared before the call', () => {
      expect(
        migrated(`const cfg = entityConfig({ entity, collection: 'products' });
withEntitiesLoadingCall(() => ({ ...cfg, fetchEntities }))`),
      ).toContain(`withEntitiesLoadingCall(cfg, () => ({ fetchEntities }))`);
    });
  });

  it('migrates inline withEntitiesCalls identity props', () => {
    expect(
      migrated(`withEntitiesCalls({ entity, collection, calls: () => ({}) })`),
    ).toBe(`withEntitiesCalls({ entity, collection }, () => ({}))`);
  });

  it('migrates .tsx files', () => {
    const result = transformEntityConfigArgs(
      imports + `withEntitiesLocalPagination({ ...cfg, pageSize: 5 })`,
      'store.tsx',
    );
    expect(result.content).toContain(
      `withEntitiesLocalPagination(cfg, { pageSize: 5 })`,
    );
  });

  it('reports lines in the migrated content, nested calls included', () => {
    const code = `withEntitiesLoadingCall({
    ...a,
    fetchEntities: () => withCallStatus({ ...b, initialValue: 'loading' }),
  })
withEntitiesLocalPagination({ pageSize: 5, ...c })`;
    const result = migrate(code);
    const lines = result.content.split('\n');
    const start = imports.split('\n').length;
    expect(result.changes).toEqual([
      { line: start, feature: 'withEntitiesLoadingCall' },
      { line: start + 1, feature: 'withCallStatus' },
    ]);
    expect(lines[start]).toContain('withCallStatus(b,');
    expect(result.skipped).toEqual([
      expect.objectContaining({
        line: start + 3,
        feature: 'withEntitiesLocalPagination',
      }),
    ]);
  });

  it('is idempotent', () => {
    const once = migrate(`withEntitiesLocalFilter({
    ...productsEntityConfig,
    defaultFilter: { search: '' },
  })`).content;
    expect(transformEntityConfigArgs(once).modified).toBe(false);
  });
});
