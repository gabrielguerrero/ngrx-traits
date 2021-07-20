import { MultipleSelectionSelectors } from './multi-selection.model';
import { LoadEntitiesSelectors } from '../load-entities';
export declare function createMultiSelectionTraitSelectors<Entity>(
  previousSelectors: LoadEntitiesSelectors<Entity>
): MultipleSelectionSelectors<Entity>;
