import {
  SingleSelectionActions,
  SingleSelectionConfig,
} from './single-selection.model';
export declare function addSingleSelection<Entity>(
  config?: SingleSelectionConfig
): import('../../../dist/model').TraitFactory<
  import('./single-selection.model').EntityAndSingleSelectionState<Entity>,
  SingleSelectionActions,
  import('./single-selection.model').SingleSelectionSelectors<Entity>,
  import('./single-selection.model').SingleSelectionMutators<unknown>,
  'singleSelection',
  SingleSelectionConfig,
  import('../../../dist/model').AllTraitConfigs
>;
