import {
  FilterEntitiesMutators,
  FilterEntitiesState,
} from './filter-entities.model';
import { LoadEntitiesState } from 'ngrx-traits/traits';

export function createFilterTraitMutators<Entity, F>(): FilterEntitiesMutators<
  Entity,
  F
> {
  function setFilters<
    S extends LoadEntitiesState<Entity> & FilterEntitiesState<F>
  >(filters: F, state: S) {
    return {
      ...state,
      filters,
    };
  }
  return { setFilters };
}
