import {
  MultipleSelectionSelectors,
  MultiSelectActions,
} from './multi-selection.model';
export declare function addMultiSelection<
  Entity
>(): import('../../../dist/model').TraitFactory<
  import('./multi-selection.model').EntityAndMultipleSelectionState<Entity>,
  MultiSelectActions,
  MultipleSelectionSelectors<Entity>,
  import('./multi-selection.model').MultipleSelectionMutators<Entity>,
  'multiSelection',
  unknown,
  import('../../../dist/model').AllTraitConfigs
>;
