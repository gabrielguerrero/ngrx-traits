import { EntityAndFilterState, FilterSelectors } from './filter.model';
export declare function selectFilter<Entity, F>(
  state: EntityAndFilterState<Entity, F>
): F;
export declare function createFilterTraitSelectors<
  Entity,
  F
>(): FilterSelectors<Entity, F>;
