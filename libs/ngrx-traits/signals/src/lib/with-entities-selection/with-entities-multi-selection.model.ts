import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

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
  [K in Collection as `isAll${Capitalize<string & K>}EntitiesSelected`]: Signal<
    'all' | 'none' | 'some'
  >;
};
type EntitySelectOptions =
  | { id: string | number }
  | { ids: (string | number)[] };
export type EntitiesMultiSelectionMethods = {
  selectEntities: (
    options:
      | (EntitySelectOptions & { clearSelectionBeforeSelect?: boolean })
      | Observable<
          EntitySelectOptions & { clearSelectionBeforeSelect?: boolean }
        >
      | Signal<EntitySelectOptions & { clearSelectionBeforeSelect?: boolean }>,
  ) => void;
  deselectEntities: (options: EntitySelectOptions) => void;
  toggleSelectEntities: (options: EntitySelectOptions) => void;
  toggleSelectAllEntities: () => void;
  clearEntitiesSelection: () => void;
};
export type NamedEntitiesMultiSelectionMethods<Collection extends string> = {
  [K in Collection as `select${Capitalize<string & K>}Entities`]: (
    options:
      | (EntitySelectOptions & { clearSelectionBeforeSelect?: boolean })
      | Observable<
          EntitySelectOptions & { clearSelectionBeforeSelect?: boolean }
        >
      | Signal<EntitySelectOptions & { clearSelectionBeforeSelect?: boolean }>,
  ) => void;
} & {
  [K in Collection as `deselect${Capitalize<string & K>}Entities`]: (
    options: EntitySelectOptions,
  ) => void;
} & {
  [K in Collection as `toggleSelect${Capitalize<string & K>}Entities`]: (
    options: EntitySelectOptions,
  ) => void;
} & {
  [K in Collection as `toggleSelectAll${Capitalize<
    string & K
  >}Entities`]: () => void;
} & {
  [K in Collection as `clear${Capitalize<string & K>}EntitiesSelection`]: () => void;
};
