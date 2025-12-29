/**
 * Schematic wrapper for v20 migration
 * Run with: ng generate @ngrx-traits/signals:migrate-entities-suffix
 */
import { Rule } from '@angular-devkit/schematics';

// Import from compiled migrations (they're in sibling directory at runtime)
const migrate = require('../../migrations/update-21-0-0/index').default;

export default function migrateEntitiesSuffix(): Rule {
  return migrate();
}
