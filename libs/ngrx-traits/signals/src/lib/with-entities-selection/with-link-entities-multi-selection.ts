import { Signal } from '@angular/core';
import { SignalStoreFeature, SignalStoreFeatureResult } from '@ngrx/signals';

import { RequireEntitiesMultiSelection } from '../feature-requirements.model';
import { LinkMethod, withLink } from '../with-link/with-link';
import {
  EntitiesMultiSelectionState,
  NamedEntitiesMultiSelectionState,
} from './with-entities-multi-selection.model';
import { getEntitiesMultiSelectionKeys } from './with-entities-multi-selection.util';

/**
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
 * // value = model<(string | number)[]>([]);
 * // valueField = form(this.store.linkIdsSelected({ syncWith: this.value }));
 */
export function withLinkEntitiesMultiSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
>(config?: {
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  Input &
    RequireEntitiesMultiSelection<
      Input,
      Collection,
      'withLinkEntitiesMultiSelection',
      Collection extends ''
        ? { state: EntitiesMultiSelectionState; props: {}; methods: {} }
        : {
            state: NamedEntitiesMultiSelectionState<Collection>;
            props: {};
            methods: {};
          }
    >,
  {
    state: {};
    props: {};
    methods: {
      [P in Collection extends ''
        ? 'idsSelected'
        : `${Collection}IdsSelected` as `link${Capitalize<
        string & P
      >}`]: LinkMethod<(string | number)[]>;
    };
  }
> {
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
