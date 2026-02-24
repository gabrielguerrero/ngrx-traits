import { Observable } from 'rxjs';

export type SortDirection = 'asc' | 'desc' | '';
export type Sort<Entity> = {
  /** The id of the column being sorted. */
  field: keyof Entity | (string & {});
  /** The sort direction. */
  direction: SortDirection;
};
export type CdkSort<Entity> = {
  /** The id of the column being sorted. */
  active: keyof Entity | (string & {});
  /** The sort direction. */
  direction: SortDirection;
};

export type EntitiesSortState<Entity> = {
  entitiesSort: Sort<Entity>;
};
export type NamedEntitiesSortState<Entity, Collection extends string> = {
  [K in Collection as `${K}EntitiesSort`]: Sort<Entity>;
};
export type EntitiesSortMethods<Entity> = {
  sortEntities: (
    options?:
      | Sort<Entity>
      | CdkSort<Entity>
      | { sort: Sort<Entity> | CdkSort<Entity> }
      | Observable<
          | Sort<Entity>
          | CdkSort<Entity>
          | { sort: Sort<Entity> | CdkSort<Entity> }
        >
      | (() =>
          | Sort<Entity>
          | CdkSort<Entity>
          | { sort: Sort<Entity> | CdkSort<Entity> }),
  ) => void;
};
export type NamedEntitiesSortMethods<Entity, Collection extends string> = {
  [K in Collection as `sort${Capitalize<string & K>}Entities`]: (
    options?:
      | Sort<Entity>
      | CdkSort<Entity>
      | { sort: Sort<Entity> | CdkSort<Entity> }
      | Observable<
          | Sort<Entity>
          | CdkSort<Entity>
          | { sort: Sort<Entity> | CdkSort<Entity> }
        >
      | (() =>
          | Sort<Entity>
          | CdkSort<Entity>
          | { sort: Sort<Entity> | CdkSort<Entity> }),
  ) => void;
};
