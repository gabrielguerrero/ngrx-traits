import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

export type SortDirection = 'asc' | 'desc' | '';
export type Sort<Entity> = {
  /** The id of the column being sorted. */
  field: keyof Entity | (string & {});
  /** The sort direction. */
  direction: SortDirection;
};

export type EntitiesSortState<Entity> = {
  entitiesSort: Sort<Entity>;
};
export type NamedEntitiesSortState<Entity, Collection extends string> = {
  [K in Collection as `${K}Sort`]: Sort<Entity>;
};
export type EntitiesSortMethods<Entity> = {
  sortEntities: (
    options?:
      | { sort: Sort<Entity> }
      | Observable<{ sort: Sort<Entity> }>
      | Signal<{ sort: Sort<Entity> }>,
  ) => void;
};
export type NamedEntitiesSortMethods<Entity, Collection extends string> = {
  [K in Collection as `sort${Capitalize<string & K>}Entities`]: (
    options?:
      | { sort: Sort<Entity> }
      | Observable<{ sort: Sort<Entity> }>
      | Signal<{ sort: Sort<Entity> }>,
  ) => void;
};
