import { SignalStoreFeature, SignalStoreFeatureResult } from '@ngrx/signals';

import { RequireEntitiesFilter } from '../feature-requirements.model';
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

/**
 * Generates a `link[Collection]EntitiesFilter()` method that connects the
 * entities filter to component signals (inputs, models, signal forms).
 *
 * Prebuilt version of `withLink` for `withEntitiesLocalFilter` /
 * `withEntitiesRemoteFilter` / `withEntitiesHybridFilter`: writes route through
 * `filter[Collection]Entities` (so filtering and its debounce still happen).
 * Echo loops are prevented because the filter features patch the filter value
 * by reference, so the link method's default `Object.is` guard converges, and
 * `filter[Collection]Entities` itself drops structurally-equal filters.
 *
 * Requires one of the withEntities*Filter features to be used before it.
 *
 * @param config - The configuration object for the feature
 * @param config.entity - The entity type to be used
 * @param config.collection - The optional collection name to be used
 * @param config.debounce - Debounce passed to filter[Collection]Entities on
 *   each sync; defaults to 0 to respect signal semantics, and so user can use the signalForm field debounce
 * @param config.forceLoad - forceLoad passed to filter[Collection]Entities
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
export function withLinkEntitiesFilter<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
>(config?: {
  entity?: Entity;
  collection?: Collection;
  debounce?: number;
  forceLoad?: boolean;
}): SignalStoreFeature<
  Input &
    RequireEntitiesFilter<
      Input,
      Collection,
      'withLinkEntitiesFilter',
      Collection extends ''
        ? {
            state: EntitiesFilterState<
              ExtractFilter<Input['state'], Collection>
            >;
            props: {};
            methods: {};
          }
        : {
            state: NamedEntitiesFilterState<
              Collection,
              ExtractFilter<Input['state'], Collection>
            >;
            props: {};
            methods: {};
          }
    >,
  {
    state: {};
    props: {};
    methods: {
      [P in Collection extends ''
        ? 'entitiesFilter'
        : `${Collection}EntitiesFilter` as `link${Capitalize<
        string & P
      >}`]: LinkMethod<ExtractFilter<Input['state'], Collection>>;
    };
  }
> {
  const { filterKey, filterEntitiesKey } = getWithEntitiesFilterKeys(config);
  return withLink(filterKey, {
    set: (value: any, store: any) => {
      (store[filterEntitiesKey] as (options: any) => void)({
        filter: value,
        debounce: config?.debounce ?? 0,
        forceLoad: config?.forceLoad,
      });
    },
    // the store already exposes filter[Collection]Entities for this write
    noSetter: true,
  } as any) as any;
}
