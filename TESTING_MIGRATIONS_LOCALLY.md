# Testing Migrations Locally

Due to Angular DevKit's need for pre-compiled JavaScript files, testing migrations and schematics locally requires a different approach.

## Option 1: Use Example App (Recommended for development)

Instead of publishing, use the workspace's example-app which can reference the source directly.

### Setup

1. Add migration support to example-app's package.json:

```json
{
  "ng-update": {
    "migrations": "../../libs/ngrx-traits/signals/src/migrations/migration-collection.json"
  },
  "schematics": "../../libs/ngrx-traits/signals/schematics/collection.json"
}
```

2. Or use npm link with the source directory:

```bash
cd libs/ngrx-traits/signals
npm link
cd ../../
cd apps/example-app
npm link @ngrx-traits/signals
```

## Option 2: Build Distribution Package for Testing

For realistic testing, you need compiled JavaScript. Use this workflow:

```bash
# 1. Compile migrations and schematics to JavaScript
tsc -p tools/tsconfig.migration.json
tsc -p tools/tsconfig.schematics.json

# 2. Rename the compiled .ts files to .js for testing
cd dist/libs/ngrx-traits/signals/migrations
for f in **/*.ts; do mv "$f" "${f%.ts}.js"; done

cd ../schematics
for f in **/*.ts; do mv "$f" "${f%.ts}.js"; done

# 3. Build the package
npm run build -- ngrx-traits-signals

# 4. Test in playground
cd apps/ngrx-traits-signals-playground
npm install @ngrx-traits/signals@file:../dist/libs/ngrx-traits/signals
ng update @ngrx-traits/signals --migrate-only --allow-dirty
```

## Option 3: Manual Testing

Apply the migration manually to test the logic:

```typescript
// src/test-migration.ts
import { getAllPatterns } from 'libs/ngrx-traits/signals/src/migrations/update-20-0-0/utils/pattern-matchers';

const testContent = `
  const store = {
    productFilter,
    isProductLoading
  };
`;

let result = testContent;
const patterns = getAllPatterns();

patterns.forEach(p => {
  result = result.replace(p.pattern, (m, ...args) => {
    const name = args[0] || m;
    return p.replacement(m, name);
  });
});

console.log(result);
// Output: Uses productEntitiesFilter, isProductEntitiesLoading, etc.
```

## Current Status

The migration logic is implemented and works in TypeScript. For production use, the build system needs to be updated to:

1. Compile TypeScript migrations/schematics to JavaScript
2. Update ng-package.json asset configuration to handle the compiled output
3. Properly reference the JavaScript exports in package.json

## Next Steps for Full Integration

1. Create a post-build script that renames compiled .ts files to .js
2. Update project.json build target to run this script
3. Test with `npm run build -- ngrx-traits-signals`
4. Test in playground with `ng update @ngrx-traits/signals --migrate-only`

## Testing the Collection Rename Schematic

For the `ng generate` schematic, similar compilation is needed. Once compiled to JavaScript, test with:

```bash
ng generate @ngrx-traits/signals:rename-collection \
  --old-name=products \
  --new-name=product \
  --path=src/app
```

## Debugging

If migrations/schematics still aren't loading:

1. Check that files are named `.js` (not `.ts`)
2. Verify exports are correct: `export default function migrate(options) { ... }`
3. Check collection.json points to correct paths
4. Run with `--verbose` flag for detailed error messages

## For Users (After Publication)

Once published to npm:

```bash
# No special setup needed - just update normally
ng update @ngrx-traits/signals --migrate-only

# Or run the collection rename schematic
ng generate @ngrx-traits/signals:rename-collection \
  --old-name=products \
  --new-name=product
```

The compilation and packaging will be handled automatically by the npm distribution.
