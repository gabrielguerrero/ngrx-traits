import { Sort } from './with-entities-sort.utils';

export type EntitiesSortState<Entity> = {
  entitiesSort: Sort<Entity>;
};
export type NamedEntitiesSortState<Entity, Collection extends string> = {
  [K in Collection as `${K}Sort`]: Sort<Entity>;
};
export type EntitiesSortMethods<Entity> = {
  sortEntities: (options: { sort: Sort<Entity> }) => void;
};
export type NamedEntitiesSortMethods<Entity, Collection extends string> = {
  [K in Collection as `sort${Capitalize<string & K>}Entities`]: (options: {
    sort: Sort<Entity>;
  }) => void;
};
