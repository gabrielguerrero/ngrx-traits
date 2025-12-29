# @ngrx-traits/signals Schematics & Migrations

This directory contains Angular schematics and migration tools for @ngrx-traits/signals.

## Directory Structure

```
.
├── src/migrations/                      # ng update migrations
│   ├── migration-collection.json         # Migration registry
│   └── update-21-0-0/                    # Version 21.0.0 migrations
│       ├── index.ts                      # Migration entry point
│       ├── rename-entities-suffix.ts     # Main migration logic
│       └── utils/
│           ├── pattern-matchers.ts       # 17 rename patterns
│           ├── ast-helpers.ts            # TypeScript AST utilities
│           └── file-visitor.ts           # File processing
├── schematics/                           # ng generate schematics
│   ├── collection.json                   # Schematic registry
│   └── rename-collection/
│       ├── schema.json                   # CLI parameter schema
│       └── index.ts                      # Implementation
└── MIGRATION_GUIDE.md                    # User migration guide
```

## Schematics

### 1. Entities Suffix Migration (ng update)

Automatically migrates code to use the new "Entities" suffix naming convention.

**Usage:**
```bash
ng update @ngrx-traits/signals --migrate-only
```

**What it does:**
- Renames 17 property/method patterns across traits
- Processes `.ts` and `.html` files
- Requires clean git working directory (override with `--skip-git-check`)
- Shows migration report with statistics

**Patterns migrated:**
- CallStatus: 7 patterns
- Pagination: 9 patterns
- Filter: 3 patterns
- Sort: 2 patterns

### 2. Rename Collection Schematic (ng generate)

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

- **pattern-matchers.spec.ts**: Tests all 17 rename patterns
- **rename-entities-suffix.spec.ts**: Tests migration logic with fixtures
- **rename-collection/index.spec.ts**: Tests collection renaming

Run tests:
```bash
npm test -- --include='**/migrations/**' --include='**/schematics/**'
```

### Integration Tests

To test with a real project:

1. Create a test project with old naming
2. Run migration: `ng update @ngrx-traits/signals --migrate-only`
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
ng update @ngrx-traits/signals --migrate-only --verbose
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

### v20.0.0
- Initial release
- 17 CallStatus, Pagination, Filter, Sort patterns
- Collection rename schematic
- Both ng update and ng generate support

## Support

- Issues: https://github.com/gabrielguerrero/ngrx-traits/issues
- Documentation: See MIGRATION_GUIDE.md in parent directory
