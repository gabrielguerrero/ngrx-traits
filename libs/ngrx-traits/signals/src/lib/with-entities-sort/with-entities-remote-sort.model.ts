import { Sort } from './with-entities-local-sort.model';

export type EntitiesRemoteSortMethods<Entity> = {
  sortEntities: (options?: {
    sort: Sort<Entity>;
    skipLoadingCall?: boolean;
  }) => void;
};
export type NamedEntitiesRemoteSortMethods<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `sort${Capitalize<string & K>}Entities`]: (options?: {
    sort: Sort<Entity>;
    skipLoadingCall?: boolean;
  }) => void;
};
