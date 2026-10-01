/**
 * Tests for the update-22-0-0 Rule
 */
import migrate from '../index';

const store = `import { withEntitiesLocalPagination } from '@ngrx-traits/signals';
export const Store = signalStore(
  withEntitiesLocalPagination({ ...productsEntityConfig, pageSize: 5 }),
);
`;

// minimal Tree, @angular-devkit/schematics does not load under vitest
function createMockTree(files: Record<string, string>) {
  const contents = new Map(Object.entries(files));
  return {
    visit: (callback: (path: string) => void) => {
      for (const path of contents.keys()) callback(path);
    },
    read: (path: string) => {
      const content = contents.get(path);
      return content === undefined ? null : Buffer.from(content);
    },
    overwrite: (path: string, content: string) => contents.set(path, content),
    readText: (path: string) => contents.get(path),
  };
}

function run(files: Record<string, string>) {
  const tree = createMockTree(files);
  const logs: { level: string; message: string }[] = [];
  const logger = {
    info: (message: string) => logs.push({ level: 'info', message }),
    warn: (message: string) => logs.push({ level: 'warn', message }),
  };
  (migrate() as any)(tree, { logger });
  return { tree, logs };
}

describe('update-22-0-0', () => {
  it('migrates ts and tsx files', () => {
    const { tree } = run({ '/src/a.ts': store, '/src/b.tsx': store });
    for (const path of ['/src/a.ts', '/src/b.tsx']) {
      expect(tree.readText(path)).toContain(
        'withEntitiesLocalPagination(productsEntityConfig, { pageSize: 5 })',
      );
    }
  });

  it('skips node_modules, dist, .angular, .nx, d.ts and non ts files', () => {
    const paths = [
      '/node_modules/lib/a.ts',
      '/dist/a.ts',
      '/.angular/cache/a.ts',
      '/.nx/cache/a.ts',
      '/src/a.d.ts',
      '/src/a.js',
      '/src/a.html',
    ];
    const { tree } = run(Object.fromEntries(paths.map((p) => [p, store])));
    for (const path of paths) expect(tree.readText(path)).toBe(store);
  });

  it('logs changes and warns about skipped calls', () => {
    const { logs } = run({
      '/src/a.ts': store,
      '/src/b.ts': `import { withEntitiesLocalPagination } from '@ngrx-traits/signals';
withEntitiesLocalPagination({ pageSize: 5, ...cfg });
`,
    });
    const messages = logs.map((l) => l.message);
    expect(messages).toContain('Migrated: /src/a.ts');
    expect(messages).toContain('  L3: withEntitiesLocalPagination');
    expect(logs.filter((l) => l.level === 'warn')).toEqual([
      {
        level: 'warn',
        message: expect.stringContaining(
          'Skipped: /src/b.ts:2 withEntitiesLocalPagination',
        ),
      },
    ]);
    expect(messages).toContain('  1 files modified');
    expect(messages).toContain('  1 feature calls migrated');
  });
});
