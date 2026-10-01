/**
 * Schematic wrapper for v22 migration
 * Run with: ng generate @ngrx-traits/signals:migrate-entity-config-args
 */
import { Rule } from '@angular-devkit/schematics';

// Import from compiled migrations (they're in sibling directory at runtime)
const migrate = require('../../migrations/update-22-0-0/index').default;

export default function migrateEntityConfigArgs(): Rule {
  return migrate();
}
