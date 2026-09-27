import { SignalStoreFeature, SignalStoreFeatureResult } from '@ngrx/signals';

import {
  LiteralCollection,
  RequireEntitiesSort,
} from '../feature-requirements.model';
import { LinkMethod, withLink } from '../with-link/with-link';
import {
  EntitiesSortState,
  NamedEntitiesSortState,
  Sort,
} from './with-entities-local-sort.model';
import { getWithEntitiesSortKeys } from './with-entities-sort.util';

type NamedLinkEntitiesSortFeature<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string,
> = {
  state: {};
  props: {};
  methods: {
    [K in `link${Capitalize<Collection>}EntitiesSort`]: LinkMethod<
      Sort<Entity>
    >;
  };
};

/**
 * @experimental
 * Generates a `link[Collection]EntitiesSort()` method that connects the
 * entities sort to component signals (inputs, models, signal forms).
 *
 * Prebuilt version of `withLink` for `withEntitiesLocalSort` /
 * `withEntitiesRemoteSort`: writes route through `sort[Collection]Entities`
 * (so the entities are re-sorted), and syncs are guarded with a structural
 * equality on the sort, preventing echo loops.
 *
 * Requires withEntitiesLocalSort or withEntitiesRemoteSort to be used before it.
 *
 * @param config - The configuration object for the feature
 * @param config.entity - The entity type to be used
 * @param config.collection - The optional collection name to be used
 *
 * @example
 * const entity = type<Product>();
 * const store = signalStore(
 *   withEntities({ entity }),
 *   withEntitiesLocalSort({
 *     entity,
 *     defaultSort: { field: 'name', direction: 'asc' },
 *   }),
 *   withLinkEntitiesSort({ entity }),
 * );
 * // in a component:
 * // sort = model<Sort<Product>>({ field: 'name', direction: 'asc' });
 * // linked = this.store.linkEntitiesSort({ syncWith: this.sort });
 */
// split into literal collection, generic collection and no collection
// overloads instead of using a Collection extends '' conditional, typescript
// can not resolve that conditional when Collection is a generic param, which
// breaks custom generic store features (issue #92), the literal and no
// collection overloads keep the readable missing feature error
export function withLinkEntitiesSort<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string,
>(config: {
  entity?: Entity;
  collection: LiteralCollection<Collection>;
}): SignalStoreFeature<
  Input &
    RequireEntitiesSort<
      Input,
      Collection,
      'withLinkEntitiesSort',
      {
        state: NamedEntitiesSortState<Entity, Collection>;
        props: {};
        methods: {};
      }
    >,
  NamedLinkEntitiesSortFeature<Input, Entity, Collection>
>;
export function withLinkEntitiesSort<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string,
>(config: {
  entity?: Entity;
  collection: Collection;
}): SignalStoreFeature<
  Input & {
    state: NamedEntitiesSortState<Entity, Collection>;
    props: {};
    methods: {};
  },
  NamedLinkEntitiesSortFeature<Input, Entity, Collection>
>;
export function withLinkEntitiesSort<
  Input extends SignalStoreFeatureResult,
  Entity,
>(config?: {
  entity?: Entity;
  collection?: never;
}): SignalStoreFeature<
  Input &
    RequireEntitiesSort<
      Input,
      '',
      'withLinkEntitiesSort',
      { state: EntitiesSortState<Entity>; props: {}; methods: {} }
    >,
  {
    state: {};
    props: {};
    methods: {
      linkEntitiesSort: LinkMethod<Sort<Entity>>;
    };
  }
>;
export function withLinkEntitiesSort(config?: {
  entity?: unknown;
  collection?: string;
}): SignalStoreFeature<any, any> {
  const { sortKey, sortEntitiesKey } = getWithEntitiesSortKeys(config);
  return withLink(sortKey, {
    set: (value: Sort<any>, store: any) => {
      (store[sortEntitiesKey] as (options: { sort: Sort<any> }) => void)({
        sort: value,
      });
    },
    equal: (a: Sort<any>, b: Sort<any>) =>
      a === b ||
      (!!a && !!b && a.field === b.field && a.direction === b.direction),
    // the store already exposes sort[Collection]Entities for this write
    noSetter: true,
  } as any) as any;
}
