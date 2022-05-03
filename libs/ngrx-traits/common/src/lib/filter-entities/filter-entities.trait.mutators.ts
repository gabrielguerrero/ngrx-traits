import {
  FilterEntitiesMutators,
  FilterEntitiesState,
} from './filter-entities.model';
import { LoadEntitiesState } from '../load-entities';

export function createFilterTraitMutators<Entity, F>(): FilterEntitiesMutators<
  Entity,
  F
> {
  function setEntitiesFilters<
    S extends LoadEntitiesState<Entity> & FilterEntitiesState<F>
  >(filters: F, state: S) {
    return {
      ...state,
      filters,
    };
  }
  return { setEntitiesFilters };
}
