import { EntityId } from '@ngrx/signals/entities';

/**
 * The id type a selection uses for an entity. With a `selectId` the id is
 * whatever it returns (`string | number` with the ngrx `entityConfig`, which
 * widens it, the narrower type with an inline one); without one, the entity's
 * `id` prop type is used.
 */
export type EntitySelectionId<Entity, SelectId = undefined> = [
  SelectId,
] extends [undefined]
  ? Entity extends { id: infer Id extends EntityId }
    ? Id
    : EntityId
  : SelectId extends (entity: never) => infer Id
    ? Id extends EntityId
      ? Id
      : EntityId
    : EntityId;

/**
 * The id type of the single selection already in the store, read from its
 * `[collection]IdSelected` state, falling back to `string | number`.
 */
export type StoreSingleSelectionId<State, Collection extends string> =
  State extends Record<
    Collection extends '' ? 'idSelected' : `${Collection}IdSelected`,
    infer Id
  >
    ? Exclude<Id, undefined> extends infer I extends EntityId
      ? I
      : EntityId
    : EntityId;

/**
 * The id type of the multi selection already in the store, read from its
 * `[collection]IdsSelectedMap` state, falling back to `string | number`.
 */
export type StoreMultiSelectionId<State, Collection extends string> =
  State extends Record<
    Collection extends '' ? 'idsSelectedMap' : `${Collection}IdsSelectedMap`,
    infer IdsMap
  >
    ? [Extract<keyof IdsMap, EntityId>] extends [never]
      ? EntityId
      : Extract<keyof IdsMap, EntityId>
    : EntityId;
