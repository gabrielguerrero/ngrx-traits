import { SignalStoreFeature, SignalStoreFeatureResult } from '@ngrx/signals';

import {
  LiteralCollection,
  RequireEntitiesFilter,
} from '../feature-requirements.model';
import { LinkMethod, withLink } from '../with-link/with-link';
import { getWithEntitiesFilterKeys } from './with-entities-filter.util';
import {
  EntitiesFilterState,
  NamedEntitiesFilterState,
} from './with-entities-local-filter.model';

type ExtractFilter<State, Collection extends string> = Collection extends ''
  ? State extends { entitiesFilter: infer F }
    ? F
    : Record<string, unknown>
  : State extends { [K in `${Collection}EntitiesFilter`]: infer F }
    ? F
    : Record<string, unknown>;

type NamedLinkEntitiesFilterFeature<
  Input extends SignalStoreFeatureResult,
  Collection extends string,
> = {
  state: {};
  props: {};
  methods: {
    [K in `link${Capitalize<Collection>}EntitiesFilter`]: LinkMethod<
      ExtractFilter<Input['state'], Collection>
    >;
  };
};

/**
 * @experimental
 * Generates a `link[Collection]EntitiesFilter()` method that connects the
 * entities filter to component signals (inputs, models, signal forms).
 *
 * Prebuilt version of `withLink` for `withEntitiesLocalFilter` /
 * `withEntitiesRemoteFilter` / `withEntitiesHybridFilter`: writes route through
 * `filter[Collection]Entities` with no debounce, so the filter lands in the
 * store synchronously and the returned signal behaves like a signal.
 * Echo loops are prevented because the filter features patch the filter value
 * by reference, so the link method's default `Object.is` guard converges, and
 * `filter[Collection]Entities` itself drops structurally-equal filters.
 *
 * Requires one of the withEntities*Filter features to be used before it.
 *
 * @param config - The configuration object for the feature
 * @param config.entity - The entity type to be used
 * @param config.collection - The optional collection name to be used
 * @param config.forceLoad - forceLoad passed to filter[Collection]Entities
 *
 * There is no debounce option: a debounced write lands in the store after the
 * signal was set, and the link can not tell a value still in flight from one
 * the store never took — a write back to the committed value inside the window
 * is dropped as a no-op, leaving the store on the superseded value. To debounce
 * a form field use Signal Forms' `debounce(path, ms)`, which delays the update
 * reaching the signal at all; to debounce anything else call
 * `filter[Collection]Entities` directly, which debounces as usual.
 *
 * @example
 * const entity = type<Product>();
 * const store = signalStore(
 *   withEntities({ entity }),
 *   withEntitiesLocalFilter({
 *     entity,
 *     defaultFilter: { search: '' },
 *     filterFn: (entity, filter) =>
 *       !filter?.search || entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
 *   }),
 *   withLinkEntitiesFilter({ entity }),
 * );
 * // in a component:
 * // filterForm = form(this.store.linkEntitiesFilter());
 */
// split into literal collection, generic collection and no collection
// overloads instead of using a Collection extends '' conditional, typescript
// can not resolve that conditional when Collection is a generic param, which
// breaks custom generic store features (issue #92), the literal and no
// collection overloads keep the readable missing feature error
export function withLinkEntitiesFilter<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string,
>(config: {
  entity?: Entity;
  collection: LiteralCollection<Collection>;
  forceLoad?: boolean;
}): SignalStoreFeature<
  Input &
    RequireEntitiesFilter<
      Input,
      Collection,
      'withLinkEntitiesFilter',
      {
        state: NamedEntitiesFilterState<
          Collection,
          ExtractFilter<Input['state'], Collection>
        >;
        props: {};
        methods: {};
      }
    >,
  NamedLinkEntitiesFilterFeature<Input, Collection>
>;
export function withLinkEntitiesFilter<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string,
>(config: {
  entity?: Entity;
  collection: Collection;
  forceLoad?: boolean;
}): SignalStoreFeature<
  // the filter type can not be read from a generic store, so any filter is
  // accepted here, the link method still gets it once Collection is known
  Input & {
    state: NamedEntitiesFilterState<Collection, any>;
    props: {};
    methods: {};
  },
  NamedLinkEntitiesFilterFeature<Input, Collection>
>;
export function withLinkEntitiesFilter<
  Input extends SignalStoreFeatureResult,
  Entity,
>(config?: {
  entity?: Entity;
  collection?: never;
  forceLoad?: boolean;
}): SignalStoreFeature<
  Input &
    RequireEntitiesFilter<
      Input,
      '',
      'withLinkEntitiesFilter',
      {
        state: EntitiesFilterState<ExtractFilter<Input['state'], ''>>;
        props: {};
        methods: {};
      }
    >,
  {
    state: {};
    props: {};
    methods: {
      linkEntitiesFilter: LinkMethod<ExtractFilter<Input['state'], ''>>;
    };
  }
>;
export function withLinkEntitiesFilter(config?: {
  entity?: unknown;
  collection?: string;
  forceLoad?: boolean;
}): SignalStoreFeature<any, any> {
  const { filterKey, filterEntitiesKey } = getWithEntitiesFilterKeys(config);
  return withLink(filterKey, {
    set: (value: any, store: any) => {
      (store[filterEntitiesKey] as (options: any) => void)({
        filter: value,
        // always 0: see the note on debouncing in the docblock above
        debounce: 0,
        forceLoad: config?.forceLoad,
      });
    },
    // the store already exposes filter[Collection]Entities for this write
    noSetter: true,
  } as any) as any;
}
