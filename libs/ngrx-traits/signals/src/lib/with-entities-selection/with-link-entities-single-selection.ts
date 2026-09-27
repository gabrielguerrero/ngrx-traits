import { SignalStoreFeature, SignalStoreFeatureResult } from '@ngrx/signals';

import {
  LiteralCollection,
  RequireEntitiesSingleSelection,
} from '../feature-requirements.model';
import { LinkMethod, withLink } from '../with-link/with-link';
import { equalAuto } from '../with-link/with-link.util';
import { StoreSingleSelectionId } from './with-entities-selection.model';
import {
  EntitiesSingleSelectionState,
  NamedEntitiesSingleSelectionState,
} from './with-entities-single-selection.model';
import { getEntitiesSingleSelectionKeys } from './with-entities-single-selection.util';

type NamedLinkEntitiesSingleSelectionFeature<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string,
> = {
  state: {};
  props: {};
  methods: {
    [K in `link${Capitalize<Collection>}IdSelected`]: LinkMethod<
      // accepts undefined, so undefined-typed signals link without a map,
      // but only ever emits null
      StoreSingleSelectionId<Input['state'], Collection> | null | undefined,
      StoreSingleSelectionId<Input['state'], Collection> | null
    >;
  };
};

/**
 * @experimental
 * Generates a `link[Collection]IdSelected()` method that connects the selected
 * entity id to component signals (inputs, models, signal forms).
 *
 * Prebuilt version of `withLink` for `withEntitiesSingleSelection`: writes
 * route through `select[Collection]Entity` / `deselect[Collection]Entity`
 * (null deselects). No selection reads as `null` rather than `undefined`, so
 * Signal Forms keeps the field instead of dropping it. It emits `Id | null`
 * but accepts `undefined` too, so an `undefined`-typed signal it reads from
 * needs no map; one it writes to must accept `null`, or use a `writeMap`.
 *
 * The id type is the one withEntitiesSingleSelection generated: the
 * entity's `id` prop type, or `string | number` when it has a selectId.
 *
 * Requires withEntitiesSingleSelection to be used before it.
 *
 * @param config - The configuration object for the feature
 * @param config.entity - The entity type to be used
 * @param config.collection - The optional collection name to be used
 *
 * @example
 * const entity = type<Product>();
 * const store = signalStore(
 *   withEntities({ entity }),
 *   withEntitiesSingleSelection({ entity }),
 *   withLinkEntitiesSingleSelection({ entity }),
 * );
 * // in a component:
 * // selectedId = model<Product['id'] | null>(null);
 * // linked = this.store.linkIdSelected({ syncWith: this.selectedId });
 */
// split into literal collection, generic collection and no collection
// overloads instead of using a Collection extends '' conditional, typescript
// can not resolve that conditional when Collection is a generic param, which
// breaks custom generic store features (issue #92), the literal and no
// collection overloads keep the readable missing feature error. The selection
// state is required with any id, with a generic entity the store id type is an
// unresolved conditional that intersecting it with EntityId would change
export function withLinkEntitiesSingleSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string,
>(config: {
  entity?: Entity;
  collection: LiteralCollection<Collection>;
}): SignalStoreFeature<
  Input &
    RequireEntitiesSingleSelection<
      Input,
      Collection,
      'withLinkEntitiesSingleSelection',
      {
        state: NamedEntitiesSingleSelectionState<Collection, any>;
        props: {};
        methods: {};
      }
    >,
  NamedLinkEntitiesSingleSelectionFeature<Input, Entity, Collection>
>;
export function withLinkEntitiesSingleSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string,
>(config: {
  entity?: Entity;
  collection: Collection;
}): SignalStoreFeature<
  Input & {
    state: NamedEntitiesSingleSelectionState<Collection, any>;
    props: {};
    methods: {};
  },
  NamedLinkEntitiesSingleSelectionFeature<Input, Entity, Collection>
>;
export function withLinkEntitiesSingleSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
>(config?: {
  entity?: Entity;
  collection?: never;
}): SignalStoreFeature<
  Input &
    RequireEntitiesSingleSelection<
      Input,
      '',
      'withLinkEntitiesSingleSelection',
      { state: EntitiesSingleSelectionState<any>; props: {}; methods: {} }
    >,
  {
    state: {};
    props: {};
    methods: {
      linkIdSelected: LinkMethod<
        StoreSingleSelectionId<Input['state'], ''> | null | undefined,
        StoreSingleSelectionId<Input['state'], ''> | null
      >;
    };
  }
>;
export function withLinkEntitiesSingleSelection(config?: {
  entity?: unknown;
  collection?: string;
}): SignalStoreFeature<any, any> {
  const { selectedIdKey, selectEntityKey, deselectEntityKey } =
    getEntitiesSingleSelectionKeys(config);
  // a computation rather than the state key, to map no selection to null
  return withLink(selectedIdKey, {
    computation: (store: any) =>
      (store[selectedIdKey] as () => string | number | undefined)() ?? null,
    set: (value: string | number | null | undefined, store: any) => {
      if (value == null) {
        (store[deselectEntityKey] as () => void)();
      } else {
        (store[selectEntityKey] as (options: { id: string | number }) => void)({
          id: value,
        });
      }
    },
    // null and undefined both mean no selection, so writing one while the
    // other is read must not deselect again
    equal: (a: unknown, b: unknown) => equalAuto(a ?? null, b ?? null),
    // the store already exposes select/deselect[Collection]Entity for this write
    noSetter: true,
  } as any) as any;
}
