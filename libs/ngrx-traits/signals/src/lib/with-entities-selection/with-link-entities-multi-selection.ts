import { Signal } from '@angular/core';
import { SignalStoreFeature, SignalStoreFeatureResult } from '@ngrx/signals';

import {
  LiteralCollection,
  RequireEntitiesMultiSelection,
} from '../feature-requirements.model';
import { LinkMethod, withLink } from '../with-link/with-link';
import {
  EntitiesMultiSelectionState,
  NamedEntitiesMultiSelectionState,
} from './with-entities-multi-selection.model';
import { getEntitiesMultiSelectionKeys } from './with-entities-multi-selection.util';
import { StoreMultiSelectionId } from './with-entities-selection.model';

type NamedLinkEntitiesMultiSelectionFeature<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string,
> = {
  state: {};
  props: {};
  methods: {
    [K in `link${Capitalize<Collection>}IdsSelected`]: LinkMethod<
      StoreMultiSelectionId<Input['state'], Collection>[]
    >;
  };
};

/**
 * @experimental
 * Generates a `link[Collection]IdsSelected()` method that connects the
 * selected entity ids to component signals (inputs, models, signal forms).
 *
 * Prebuilt version of `withLink` for `withEntitiesMultiSelection`: reads the
 * `[collection]IdsSelected` computed, writes route through
 * `select[Collection]Entities` with `clearSelectionBeforeSelect` (an empty
 * array clears the selection), and syncs are guarded with an order-insensitive
 * ids equality — the selection map does not preserve the order of the ids it
 * was given, so an order-sensitive compare would cause echo loops.
 *
 * The id type is the one withEntitiesMultiSelection generated: the entity's
 * `id` prop type, or `string | number` when it has a selectId.
 *
 * Requires withEntitiesMultiSelection to be used before it.
 *
 * @param config - The configuration object for the feature
 * @param config.entity - The entity type to be used
 * @param config.collection - The optional collection name to be used
 *
 * @example
 * const entity = type<Product>();
 * const store = signalStore(
 *   withEntities({ entity }),
 *   withEntitiesMultiSelection({ entity }),
 *   withLinkEntitiesMultiSelection({ entity }),
 * );
 * // in a component:
 * // value = model<Product['id'][]>([]);
 * // valueField = form(this.store.linkIdsSelected({ syncWith: this.value }));
 */
// split into literal collection, generic collection and no collection
// overloads instead of using a Collection extends '' conditional, typescript
// can not resolve that conditional when Collection is a generic param, which
// breaks custom generic store features (issue #92), the literal and no
// collection overloads keep the readable missing feature error
export function withLinkEntitiesMultiSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string,
>(config: {
  entity?: Entity;
  collection: LiteralCollection<Collection>;
}): SignalStoreFeature<
  Input &
    RequireEntitiesMultiSelection<
      Input,
      Collection,
      'withLinkEntitiesMultiSelection',
      {
        state: NamedEntitiesMultiSelectionState<Collection>;
        props: {};
        methods: {};
      }
    >,
  NamedLinkEntitiesMultiSelectionFeature<Input, Entity, Collection>
>;
export function withLinkEntitiesMultiSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string,
>(config: {
  entity?: Entity;
  collection: Collection;
}): SignalStoreFeature<
  Input & {
    state: NamedEntitiesMultiSelectionState<Collection>;
    props: {};
    methods: {};
  },
  NamedLinkEntitiesMultiSelectionFeature<Input, Entity, Collection>
>;
export function withLinkEntitiesMultiSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
>(config?: {
  entity?: Entity;
  collection?: never;
}): SignalStoreFeature<
  Input &
    RequireEntitiesMultiSelection<
      Input,
      '',
      'withLinkEntitiesMultiSelection',
      { state: EntitiesMultiSelectionState; props: {}; methods: {} }
    >,
  {
    state: {};
    props: {};
    methods: {
      linkIdsSelected: LinkMethod<StoreMultiSelectionId<Input['state'], ''>[]>;
    };
  }
>;
export function withLinkEntitiesMultiSelection(config?: {
  entity?: unknown;
  collection?: string;
}): SignalStoreFeature<any, any> {
  const {
    selectedEntitiesIdsKey,
    selectEntitiesKey,
    clearEntitiesSelectionKey,
  } = getEntitiesMultiSelectionKeys(config);
  return withLink(selectedEntitiesIdsKey, {
    computation: (store: any) =>
      (store[selectedEntitiesIdsKey] as Signal<(string | number)[]>)(),
    set: (ids: (string | number)[], store: any) => {
      if (ids.length) {
        (
          store[selectEntitiesKey] as (options: {
            ids: (string | number)[];
            clearSelectionBeforeSelect?: boolean;
          }) => void
        )({ ids, clearSelectionBeforeSelect: true });
      } else {
        (store[clearEntitiesSelectionKey] as () => void)();
      }
    },
    // set semantics on purpose: the selection map does not preserve the order
    // of the ids it was given, so an order-sensitive compare would echo loop
    equal: 'set',
    // the store already exposes select/clear[Collection]Entities for this write
    noSetter: true,
  } as any) as any;
}
