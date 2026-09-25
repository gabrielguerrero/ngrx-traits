import { SignalStoreFeature, SignalStoreFeatureResult } from '@ngrx/signals';

import { RequireEntitiesSingleSelection } from '../feature-requirements.model';
import { LinkMethod, withLink } from '../with-link/with-link';
import { equalAuto } from '../with-link/with-link.util';
import {
  EntitiesSingleSelectionState,
  NamedEntitiesSingleSelectionState,
} from './with-entities-single-selection.model';
import { getEntitiesSingleSelectionKeys } from './with-entities-single-selection.util';

/**
 * @experimental
 * Generates a `link[Collection]IdSelected()` method that connects the selected
 * entity id to component signals (inputs, models, signal forms).
 *
 * Prebuilt version of `withLink` for `withEntitiesSingleSelection`: writes
 * route through `select[Collection]Entity` / `deselect[Collection]Entity`
 * (null deselects). No selection reads as `null` rather than `undefined`, so
 * Signal Forms keeps the field instead of dropping it. It emits `null` but
 * accepts `undefined` too, so an `undefined`-typed signal it reads from needs
 * no map; one it writes to must accept `null`, or use a `writeMap`.
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
 * // selectedId = model<string | number | null>(null);
 * // linked = this.store.linkIdSelected({ syncWith: this.selectedId });
 */
export function withLinkEntitiesSingleSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
>(config?: {
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  Input &
    RequireEntitiesSingleSelection<
      Input,
      Collection,
      'withLinkEntitiesSingleSelection',
      Collection extends ''
        ? { state: EntitiesSingleSelectionState; props: {}; methods: {} }
        : {
            state: NamedEntitiesSingleSelectionState<Collection>;
            props: {};
            methods: {};
          }
    >,
  {
    state: {};
    props: {};
    methods: {
      [P in Collection extends ''
        ? 'idSelected'
        : `${Collection}IdSelected` as `link${Capitalize<
        string & P
      >}`]: LinkMethod<
        // accepts undefined, so undefined-typed signals link without a map,
        // but only ever emits null
        string | number | null | undefined,
        string | number | null
      >;
    };
  }
> {
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
