import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

export type EntitiesSingleSelectionState = {
  idSelected: string | number | undefined;
};
export type NamedEntitiesSingleSelectionState<Collection extends string> = {
  [K in Collection as `${K}IdSelected`]: string | number | undefined;
};
export type EntitiesSingleSelectionComputed<Entity> = {
  entitySelected: Signal<Entity | undefined>;
};
export type NamedEntitiesSingleSelectionComputed<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `${K}EntitySelected`]: Signal<Entity | undefined>;
};
type EntitySelectOptions = { id: string | number } | undefined;
export type EntitiesSingleSelectionMethods = {
  selectEntity: (
    options:
      | EntitySelectOptions
      | Observable<EntitySelectOptions>
      | Signal<EntitySelectOptions>,
  ) => void;
  deselectEntity: () => void;
  toggleSelectEntity: (
    options:
      | EntitySelectOptions
      | Observable<EntitySelectOptions>
      | Signal<EntitySelectOptions>,
  ) => void;
};
export type NamedEntitiesSingleSelectionMethods<Collection extends string> = {
  [K in Collection as `select${Capitalize<string & K>}Entity`]: (
    options:
      | EntitySelectOptions
      | Observable<EntitySelectOptions>
      | Signal<EntitySelectOptions>,
  ) => void;
} & {
  [K in Collection as `deselect${Capitalize<string & K>}Entity`]: () => void;
} & {
  [K in Collection as `toggleSelect${Capitalize<string & K>}Entity`]: (
    options:
      | EntitySelectOptions
      | Observable<EntitySelectOptions>
      | Signal<EntitySelectOptions>,
  ) => void;
};
