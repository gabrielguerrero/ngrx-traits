import { Signal } from '@angular/core';
import { EntityId } from '@ngrx/signals/entities';
import { Observable } from 'rxjs';

export type EntitiesSingleSelectionState<Id extends EntityId = EntityId> = {
  idSelected: Id | undefined;
};
export type NamedEntitiesSingleSelectionState<
  Collection extends string,
  Id extends EntityId = EntityId,
> = {
  [K in Collection as `${K}IdSelected`]: Id | undefined;
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
type EntitySelectOptions<Id extends EntityId> = { id: Id } | undefined;
type EntitySelectInput<Id extends EntityId> =
  | EntitySelectOptions<Id>
  | Observable<EntitySelectOptions<Id>>
  | (() => EntitySelectOptions<Id>);
export type EntitiesSingleSelectionMethods<Id extends EntityId = EntityId> = {
  selectEntity: (options: EntitySelectInput<Id>) => void;
  deselectEntity: () => void;
  toggleSelectEntity: (options: EntitySelectInput<Id>) => void;
};
export type NamedEntitiesSingleSelectionMethods<
  Collection extends string,
  Id extends EntityId = EntityId,
> = {
  [K in Collection as `select${Capitalize<string & K>}Entity`]: (
    options: EntitySelectInput<Id>,
  ) => void;
} & {
  [K in Collection as `deselect${Capitalize<string & K>}Entity`]: () => void;
} & {
  [K in Collection as `toggleSelect${Capitalize<string & K>}Entity`]: (
    options: EntitySelectInput<Id>,
  ) => void;
};
