import {
  EntityAndMultipleSelectionState,
  MultipleSelectionState,
} from './multi-selection.model';
export declare function multiDeselect<S extends MultipleSelectionState>(
  id: number | string,
  state: S
): S;
export declare function multiSelect<S extends MultipleSelectionState>(
  id: number | string,
  state: S
): S;
export declare function multiToggleSelect<S extends MultipleSelectionState>(
  id: number | string,
  state: S
): S;
export declare function multiClearSelection<S extends MultipleSelectionState>(
  state: S
): S;
export declare function selectTotalSelected<
  T,
  S extends EntityAndMultipleSelectionState<T>
>(state: S): number;
export declare type Selected = 'all' | 'some' | 'none';
