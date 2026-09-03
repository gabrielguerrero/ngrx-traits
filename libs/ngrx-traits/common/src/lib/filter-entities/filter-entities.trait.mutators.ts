import { LoadEntitiesState } from '../load-entities';
import {
  FilterEntitiesMutators,
  FilterEntitiesState,
} from './filter-entities.model';

export function createFilterTraitMutators<Entity, F>(): FilterEntitiesMutators<
  Entity,
  F
> {
  function setEntitiesFilters<
    S extends LoadEntitiesState<Entity> & FilterEntitiesState<F>,
  >(filters: F, state: S) {
    return {
      ...state,
      filters,
    };
  }
  return { setEntitiesFilters };
}
