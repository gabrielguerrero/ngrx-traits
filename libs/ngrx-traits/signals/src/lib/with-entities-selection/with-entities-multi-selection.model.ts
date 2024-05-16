import { Signal } from '@angular/core';

export type EntitiesMultiSelectionState = {
  idsSelectedMap: Record<string | number, boolean>;
};
export type NamedEntitiesMultiSelectionState<Collection extends string> = {
  [K in Collection as `${K}IdsSelectedMap`]: Record<string | number, boolean>;
};
export type EntitiesMultiSelectionComputed<Entity> = {
  entitiesSelected: Signal<Entity[]>;
  idsSelected: Signal<(string | number)[]>;
  isAllEntitiesSelected: Signal<'all' | 'none' | 'some'>;
};
export type NamedEntitiesMultiSelectionComputed<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `${K}EntitiesSelected`]: Signal<Entity[]>;
} & {
  [K in Collection as `${K}IdsSelected`]: Signal<(string | number)[]>;
} & {
  [K in Collection as `isAll${Capitalize<string & K>}Selected`]: Signal<
    'all' | 'none' | 'some'
  >;
};
export type EntitiesMultiSelectionMethods = {
  selectEntities: (
    options: { id: string | number } | { ids: (string | number)[] },
  ) => void;
  deselectEntities: (
    options: { id: string | number } | { ids: (string | number)[] },
  ) => void;
  toggleSelectEntities: (
    options: { id: string | number } | { ids: (string | number)[] },
  ) => void;
  toggleSelectAllEntities: () => void;
  clearEntitiesSelection: () => void;
};
export type NamedEntitiesMultiSelectionMethods<Collection extends string> = {
  [K in Collection as `select${Capitalize<string & K>}Entities`]: (
    options: { id: string | number } | { ids: (string | number)[] },
  ) => void;
} & {
  [K in Collection as `deselect${Capitalize<string & K>}Entities`]: (
    options: { id: string | number } | { ids: (string | number)[] },
  ) => void;
} & {
  [K in Collection as `toggleSelect${Capitalize<string & K>}Entities`]: (
    options: { id: string | number } | { ids: (string | number)[] },
  ) => void;
} & {
  [K in Collection as `toggleSelectAll${Capitalize<
    string & K
  >}Entities`]: () => void;
} & {
  [K in Collection as `clear${Capitalize<string & K>}Selection`]: () => void;
};
