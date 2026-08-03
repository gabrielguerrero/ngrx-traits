import { SignalStoreFeature, SignalStoreFeatureResult } from '@ngrx/signals';

import { LinkMethod, withLink } from '../with-link/with-link';
import {
  EntitiesSingleSelectionState,
  NamedEntitiesSingleSelectionState,
} from './with-entities-single-selection.model';
import { getEntitiesSingleSelectionKeys } from './with-entities-single-selection.util';

/**
 * Generates a `link[Collection]IdSelected()` method that connects the selected
 * entity id to component signals (inputs, models, signal forms).
 *
 * Prebuilt version of `withLink` for `withEntitiesSingleSelection`: writes
 * route through `select[Collection]Entity` / `deselect[Collection]Entity`
 * (undefined deselects).
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
 * // selectedId = model<string | number | undefined>(undefined);
 * // constructor() { this.store.linkIdSelected(this.selectedId); }
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
    (Collection extends ''
      ? { state: EntitiesSingleSelectionState; props: {}; methods: {} }
      : {
          state: NamedEntitiesSingleSelectionState<Collection>;
          props: {};
          methods: {};
        }),
  {
    state: {};
    props: {};
    methods: {
      [P in Collection extends ''
        ? 'idSelected'
        : `${Collection}IdSelected` as `link${Capitalize<
        string & P
      >}`]: LinkMethod<string | number | undefined>;
    };
  }
> {
  const { selectedIdKey, selectEntityKey, deselectEntityKey } =
    getEntitiesSingleSelectionKeys(config);
  return withLink(selectedIdKey, {
    update: (value: string | number | undefined, store: any) => {
      if (value == null) {
        (store[deselectEntityKey] as () => void)();
      } else {
        (store[selectEntityKey] as (options: { id: string | number }) => void)({
          id: value,
        });
      }
    },
  } as any) as any;
}
