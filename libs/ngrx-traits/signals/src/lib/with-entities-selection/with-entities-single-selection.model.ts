import { Signal } from '@angular/core';

export type EntitiesSingleSelectionState = {
  entitiesSelectedId?: string | number;
};
export type NamedEntitiesSingleSelectionState<Collection extends string> = {
  [K in Collection as `${K}SelectedId`]?: string | number;
};
export type EntitiesSingleSelectionComputed<Entity> = {
  entitiesSelectedEntity: Signal<Entity | undefined>;
};
export type NamedEntitiesSingleSelectionComputed<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `${K}SelectedEntity`]: Signal<Entity | undefined>;
};
export type EntitiesSingleSelectionMethods = {
  selectEntity: (options: { id: string | number }) => void;
  deselectEntity: (options: { id: string | number }) => void;
  toggleEntity: (options: { id: string | number }) => void;
};
export type NamedEntitiesSingleSelectionMethods<Collection extends string> = {
  [K in Collection as `select${Capitalize<string & K>}Entity`]: (options: {
    id: string | number;
  }) => void;
} & {
  [K in Collection as `deselect${Capitalize<string & K>}Entity`]: (options: {
    id: string | number;
  }) => void;
} & {
  [K in Collection as `toggle${Capitalize<string & K>}Entity`]: (options: {
    id: string | number;
  }) => void;
};
