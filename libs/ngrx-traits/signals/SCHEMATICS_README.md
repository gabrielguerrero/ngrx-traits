# @ngrx-traits/signals Schematics & Migrations

This directory contains Angular schematics and migration tools for @ngrx-traits/signals.

## Directory Structure

```
.
├── src/migrations/                              # ng update migrations
│   ├── migration-collection.json                 # Migration registry
│   ├── update-21-0-0/                            # v21.0.0: Entities suffix rename
│   │   ├── index.ts                              # Migration entry point
│   │   ├── targeted/                             # Store analysis, dependency resolution, rename patterns, transforms
│   │   └── __tests__/                            # Specs + fixtures
│   └── update-22-0-0/                            # v22.0.0: (entityConfig, options) call form
│       ├── index.ts                              # Migration entry point
│       ├── entity-config-args-transformer.ts     # Call transformation logic
│       └── __tests__/                            # Specs
├── schematics/                                   # ng generate schematics
│   ├── collection.json                           # Schematic registry
│   ├── rename-collection/                        # index.ts, schema.json, index.spec.ts
│   ├── migrate-entities-suffix/                  # index.ts (runs update-21-0-0)
│   └── migrate-entity-config-args/               # index.ts (runs update-22-0-0)
└── MIGRATION_GUIDE.md                            # User migration guide
```

## Schematics

### 1. Entities Suffix Migration (ng update)

Automatically migrates code to use the new "Entities" suffix naming convention.

**Usage:**
```bash
ng update @ngrx-traits/signals --name update-21-0-0
```

**What it does:**
- Renames trait-generated property/method patterns for each collection
- Processes `.ts` and `.html` files
- Requires clean git working directory (override with `--allow-dirty`)
- Logs a summary to the console

**Patterns migrated:**
- CallStatus: 7 patterns
- Pagination: 9 patterns
- Filter: 3 patterns
- Sort: 2 patterns
- Selection: 2 patterns

### 2. entityConfig Args Migration (ng update / ng generate)

Moves the entityConfig of the withEntities* features out of their single config
object into the first arg, `withX({ ...entityConfig, ...options })` ->
`withX(entityConfig, options)`. Optional and recommended on `ng update` to v22:
pre-selected in the interactive prompt; in non-interactive runs (no TTY or `CI`
set) the Angular CLI skips it and prints the command to run it later. `nx migrate`
ignores `optional`, so Nx users remove `update-22-0-0` from `migrations.json` to
skip it. Run it later, or on its own:

```bash
ng update @ngrx-traits/signals --name update-22-0-0
ng generate @ngrx-traits/signals:migrate-entity-config-args
```

**What it does:**
- `withEntitiesLocalFilter({ ...cfg, defaultFilter, filterFn })` -> `withEntitiesLocalFilter(cfg, { defaultFilter, filterFn })`
- `withEntitiesSyncToRouteQueryParams({ ...cfg })` -> `withEntitiesSyncToRouteQueryParams(cfg)`
- `withEntitiesLocalSort({ entity, collection, defaultSort })` -> `withEntitiesLocalSort({ entity, collection }, { defaultSort })`
- `withEntitiesCalls({ ...cfg, calls: (store) => ({...}) })` -> `withEntitiesCalls(cfg, (store) => ({...}))`
- `withEntitiesLoadingCall((store) => ({ ...cfg, fetchEntities }))` -> `withEntitiesLoadingCall(cfg, (store) => ({ fetchEntities }))`
- Leaves inline configs without a collection (`withX({ entity, ...options })`),
  `withCallStatus({ prop })` and `withCallStatus({ collection })` as they are
- The spread is taken as an entityConfig when it is a variable; one declared in
  the same file must hold `entityConfig(...)` or a literal with only
  entity/collection/selectId, otherwise the call is skipped
- Warns and skips ambiguous calls (several spreads, spread plus
  entity/collection, options before the spread, a spread that is not a
  variable, a factory spread reading the store or declared after the call,
  calls through `import * as`); the single object form still works so they
  need no change
- A factory spread of an imported entityConfig is now read when the store is
  defined rather than created, which matters only with circular imports
- Only touches features imported from `@ngrx-traits/signals`; run your
  formatter afterwards

### 3. Rename Collection Schematic (ng generate)

Refactors collection names from plural to singular form.

**Usage:**
```bash
ng generate @ngrx-traits/signals:rename-collection \
  --old-name=products \
  --new-name=product \
  --path=src/app
```

**What it does:**
- Dynamically generates ~35 rename patterns based on collection names
- Processes specified folder recursively
- Handles trait properties + base @ngrx/signals properties
- Supports multiple naming variants (product, Product, products, Products)

## Implementation Details

### Pattern Matching

Patterns are defined as regex-based transformations in `utils/pattern-matchers.ts`:

```typescript
{
  pattern: /(\w+)CallStatus(?!Entities)/g,
  replacement: (match, name) => `${name}EntitiesCallStatus`,
  description: '{name}CallStatus → {name}EntitiesCallStatus'
}
```

Negative lookahead `(?!Entities)` prevents double-migration.

### File Processing

The `file-visitor.ts` utility:
- Walks directory tree recursively
- Skips `node_modules`, `dist`, `.git`, etc.
- Reads and writes files safely
- Extracts relative paths for logging

### AST Transformation (TypeScript)

While the main implementation uses regex for simplicity, `ast-helpers.ts` provides:
- TypeScript AST parsing
- Node visitor utilities
- Identifier extraction
- Position-based text replacement

### HTML Processing

HTML templates use regex-based replacement for:
- Template bindings: `{{ store.productFilter() }}`
- Property bindings: `[data]="store.filter()"`
- Event bindings: `(click)="store.loadPage()"`

## Build Configuration

### TypeScript Configs

**`tools/tsconfig.migration.json`:**
- Targets CommonJS for Node.js compatibility
- Excludes test files and fixtures
- Output: `dist/libs/ngrx-traits/signals/migrations`

**`tools/tsconfig.schematics.json`:**
- Similar config for schematics
- Output: `dist/libs/ngrx-traits/signals/schematics`

### Package Configuration

**`package.json` additions:**
```json
{
  "ng-update": {
    "migrations": "./migrations/migration-collection.json"
  },
  "schematics": "./schematics/collection.json"
}
```

**`ng-package.json` assets:**
```json
{
  "assets": [
    {
      "glob": "**/*",
      "input": "src/migrations",
      "output": "./migrations"
    },
    {
      "glob": "**/*.json",
      "input": "schematics",
      "output": "./schematics"
    }
  ]
}
```

## Testing

### Unit Tests

- **rename-entities-suffix.spec.ts**: Tests migration logic with fixtures
- **rename-collection/index.spec.ts**: Tests collection renaming

Run tests:
```bash
npm test -- --include='**/migrations/**' --include='**/schematics/**'
```

### Integration Tests

To test with a real project:

1. Create a test project with old naming
2. Run migration: `ng update @ngrx-traits/signals --name update-21-0-0`
3. Verify all properties renamed correctly
4. Run app tests to ensure functionality

## Development

### Adding New Patterns

To add a new pattern for a future trait:

1. Add to `utils/pattern-matchers.ts`:
```typescript
const createNewTraitPatterns = (): RenamePattern[] => [
  {
    pattern: /oldPattern/g,
    replacement: (match, name) => `newPattern`,
    description: 'description'
  }
];
```

2. Update `getAllPatterns()` to include new category
3. Add tests in `*.spec.ts` files

### Debugging

Enable detailed logging:

```typescript
// In rename-entities-suffix.ts
context.logger.debug(`Processing ${filePath}`);
context.logger.debug(`Matched: ${match[0]}`);
```

Run with verbose flag:
```bash
ng update @ngrx-traits/signals --name update-21-0-0 --verbose
```

## Known Limitations

1. **String literals**: Properties in strings (e.g., API keys) may be renamed incorrectly
2. **Comments**: Property names in comments are renamed (usually desired)
3. **Custom stores**: Only trait-generated properties are handled; custom properties need manual updates
4. **Dynamic property names**: No support for computed property names

## Performance

- ~100 files processed per second (depends on file size and disk speed)
- Memory usage: ~50-100MB for typical projects
- Migration can be interrupted and rerun safely (idempotent)

## Version History

### v21.0.0
- Initial release
- CallStatus, Pagination, Filter, Sort, Selection patterns
- Collection rename schematic
- Both ng update and ng generate support

## Support

- Issues: https://github.com/gabrielguerrero/ngrx-traits/issues
- Documentation: See MIGRATION_GUIDE.md in parent directory
