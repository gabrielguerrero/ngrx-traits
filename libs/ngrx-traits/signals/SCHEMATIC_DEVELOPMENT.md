# Schematic Development Guide

Quick reference for developers working with ngrx-traits schematics and migrations.

## File Organization

```
src/migrations/
├── migration-collection.json              # Registry for ng update
└── update-21-0-0/
    ├── index.ts                           # Entry point (exports default)
    ├── rename-entities-suffix.ts          # Main migration logic
    ├── utils/
    │   ├── pattern-matchers.ts            # Pattern definitions
    │   ├── ast-helpers.ts                 # AST utilities
    │   └── file-visitor.ts                # File I/O utilities
    └── __tests__/
        ├── fixtures/                      # Before/after sample files
        └── rename-entities-suffix.spec.ts # Integration tests

schematics/
├── collection.json                        # Schematic registry
└── rename-collection/
    ├── schema.json                        # CLI schema
    ├── index.ts                           # Implementation
    └── index.spec.ts                      # Tests
```

## Building & Testing

### Build Migrations Only
```bash
tsc -p tools/tsconfig.migration.json
```

### Build Schematics Only
```bash
tsc -p tools/tsconfig.schematics.json
```

### Build All (via project targets)
```bash
nx run ngrx-traits-signals:build-migrations
nx run ngrx-traits-signals:build-schematics
```

### Run Tests
```bash
npm test -- --include='**/migrations/**'
npm test -- --include='**/schematics/**'
```

## Adding a New Pattern

### 1. Add to Pattern Matchers

Edit `src/migrations/update-21-0-0/utils/pattern-matchers.ts`:

```typescript
const createNewTraitPatterns = (): RenamePattern[] => [
  {
    pattern: /oldPattern/g,
    replacement: (match, name) => `newPattern`,
    description: 'old → new'
  }
];
```

### 2. Update getAllPatterns()

```typescript
export function getAllPatterns(): RenamePattern[] {
  return [
    ...createCallStatusPatterns(),
    ...createPaginationPatterns(),
    ...createFilterPatterns(),
    ...createSortPatterns(),
    ...createNewTraitPatterns()  // Add here
  ];
}
```

### 3. Add Tests

Edit `src/migrations/update-21-0-0/utils/pattern-matchers.spec.ts`:

```typescript
describe('New Trait patterns', () => {
  const patterns = getPatternsByCategory('newTrait');

  it('should rename oldPattern to newPattern', () => {
    // Test implementation
  });
});
```

### 4. Verify

```bash
npm test -- --include='**/pattern-matchers.spec.ts'
tsc -p tools/tsconfig.migration.json
```

## Debugging Migration

### Enable Verbose Logging

In `rename-entities-suffix.ts`, uncomment debug lines:

```typescript
context.logger.debug(`Processing ${filePath}`);
context.logger.debug(`Found matches: ${JSON.stringify(matches)}`);
```

### Test with Sample Project

```bash
# Create test project with old naming
mkdir /tmp/test-project
cd /tmp/test-project
ng new myapp --skip-install

# Copy sample component with old naming
# Run migration
ng update @ngrx-traits/signals --migrate-only --verbose
```

### Manual Testing

For quick pattern testing without full migration:

```typescript
// In pattern-matchers.spec.ts or separate test file
const testContent = `
  const store = {
    productFilter,
    isProductLoading
  };
`;

const patterns = getAllPatterns();
let result = testContent;

patterns.forEach(p => {
  result = result.replace(p.pattern, (m, ...args) => {
    const name = args[0] || m;
    return p.replacement(m, name);
  });
});

console.log(result);
```

## Extending Collection Rename

### Add Custom Rename Logic

Edit `schematics/rename-collection/index.ts`:

```typescript
function generateRenamePatterns(oldName: string, newName: string): RenamePattern[] {
  // Add custom patterns here
  return [
    // ... existing patterns
    {
      pattern: new RegExp(`custom${oldCapital}Pattern`, 'g'),
      replacement: () => `custom${newCapital}Pattern`
    }
  ];
}
```

## Testing Migrations

### Unit Test Example

```typescript
it('should rename properties in TypeScript', () => {
  const input = `
    const store = {
      productFilter,
      isProductLoading
    };
  `;

  const result = transformTypeScriptFile(input);

  expect(result.modified).toBe(true);
  expect(result.content).toContain('productEntitiesFilter');
  expect(result.content).toContain('isProductEntitiesLoading');
});
```

### Integration Test Example

```typescript
it('should migrate component file', () => {
  // Create temp component
  const component = readFile('fixtures/before.component.ts');

  // Run transformation
  const result = transformTypeScriptFile(component);

  // Compare with expected
  const expected = readFile('fixtures/after.component.ts');
  expect(result.content).toEqual(expected);
});
```

## Common Issues & Solutions

### Pattern Not Matching

**Problem:** `productFilter` doesn't match pattern

**Check:**
1. Regex flags are correct (usually need `/g`)
2. Negative lookahead `(?!Entities)` isn't blocking valid matches
3. Word boundaries `\b` if needed

**Fix:**
```typescript
// Add test to understand the issue
const text = 'productFilter';
const pattern = /(\w+)Filter(?!Entities)/g;
console.log(pattern.exec(text)); // Debug output
```

### Double Migration

**Problem:** Already migrated code gets renamed again

**Solution:** Use negative lookahead
```typescript
pattern: /(\w+)Filter(?!Entities)/g,  // Won't match productEntitiesFilter
```

### File Encoding Issues

**Problem:** Non-UTF8 files cause errors

**Solution:** Handle encoding in file-visitor.ts
```typescript
fs.readFileSync(filePath, 'utf-8');  // Explicit UTF-8
```

## Performance Tips

### For Large Projects

1. Process files in batches
2. Cache regex objects
3. Skip node_modules and build directories
4. Run with `--skip-confirmation` for automation

### Memory Optimization

```typescript
// Don't load entire directory tree at once
function* walkDirectoryLazy(dir: string) {
  // Yield results as found
}
```

## Release Checklist

Before releasing a new migration version:

- [ ] All tests pass
- [ ] TypeScript compilation succeeds
- [ ] No console errors with `--verbose` flag
- [ ] Tested with sample project
- [ ] Documentation updated
- [ ] version in migration-collection.json bumped
- [ ] CHANGELOG updated
- [ ] Example provided in MIGRATION_GUIDE.md

## Useful Links

- [Angular Schematics Guide](https://angular.io/guide/schematics)
- [Angular DevKit Documentation](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit)
- [TypeScript AST API](https://www.typescriptlang.org/docs/handbook/compiler-api.html)
- [@ngrx/signals Documentation](https://ngrx.io/guide/signals)

## Contact & Support

For questions or issues with schematics:
1. Check this guide
2. Review test files for examples
3. Check SCHEMATICS_README.md for technical details
4. Open issue on GitHub
