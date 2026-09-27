import { Signal } from '@angular/core';
import { EntityId } from '@ngrx/signals/entities';
import { Observable } from 'rxjs';

export type EntitiesMultiSelectionState<Id extends EntityId = EntityId> = {
  // partial: only the ids ever selected or deselected are keys
  idsSelectedMap: Partial<Record<Id, boolean>>;
};
export type NamedEntitiesMultiSelectionState<
  Collection extends string,
  Id extends EntityId = EntityId,
> = {
  [K in Collection as `${K}IdsSelectedMap`]: Partial<Record<Id, boolean>>;
};
export type EntitiesMultiSelectionComputed<
  Entity,
  Id extends EntityId = EntityId,
> = {
  entitiesSelected: Signal<Entity[]>;
  idsSelected: Signal<Id[]>;
  isAllEntitiesSelected: Signal<'all' | 'none' | 'some'>;
};
export type NamedEntitiesMultiSelectionComputed<
  Entity,
  Collection extends string,
  Id extends EntityId = EntityId,
> = {
  [K in Collection as `${K}EntitiesSelected`]: Signal<Entity[]>;
} & {
  [K in Collection as `${K}IdsSelected`]: Signal<Id[]>;
} & {
  [K in Collection as `isAll${Capitalize<string & K>}EntitiesSelected`]: Signal<
    'all' | 'none' | 'some'
  >;
};
type EntitySelectOptions<Id extends EntityId> = { id: Id } | { ids: Id[] };
type EntitySelectInput<Id extends EntityId> =
  | (EntitySelectOptions<Id> & { clearSelectionBeforeSelect?: boolean })
  | Observable<
      EntitySelectOptions<Id> & { clearSelectionBeforeSelect?: boolean }
    >
  | (() => EntitySelectOptions<Id> & { clearSelectionBeforeSelect?: boolean });
export type EntitiesMultiSelectionMethods<Id extends EntityId = EntityId> = {
  selectEntities: (options: EntitySelectInput<Id>) => void;
  deselectEntities: (options: EntitySelectOptions<Id>) => void;
  toggleSelectEntities: (options: EntitySelectOptions<Id>) => void;
  toggleSelectAllEntities: () => void;
  clearEntitiesSelection: () => void;
};
export type NamedEntitiesMultiSelectionMethods<
  Collection extends string,
  Id extends EntityId = EntityId,
> = {
  [K in Collection as `select${Capitalize<string & K>}Entities`]: (
    options: EntitySelectInput<Id>,
  ) => void;
} & {
  [K in Collection as `deselect${Capitalize<string & K>}Entities`]: (
    options: EntitySelectOptions<Id>,
  ) => void;
} & {
  [K in Collection as `toggleSelect${Capitalize<string & K>}Entities`]: (
    options: EntitySelectOptions<Id>,
  ) => void;
} & {
  [K in Collection as `toggleSelectAll${Capitalize<
    string & K
  >}Entities`]: () => void;
} & {
  [K in Collection as `clear${Capitalize<string & K>}EntitiesSelection`]: () => void;
};
