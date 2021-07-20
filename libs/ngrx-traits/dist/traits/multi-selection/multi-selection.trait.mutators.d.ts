import {
  MultipleSelectionMutators,
  MultipleSelectionSelectors,
} from './multi-selection.model';
export declare function createMultiSelectionTraitMutators<Entity>({
  isAllSelected,
}: MultipleSelectionSelectors<Entity>): MultipleSelectionMutators<Entity>;
