import { SignalStoreFeatureResult } from '@ngrx/signals';

import { NamedSetEntitiesResult } from '../with-entities-pagination/with-entities-local-pagination.model';

/**
 * The key an entities pagination feature generates to store a page result.
 */
type SetEntitiesPagedResultKey<Collection extends string> =
  Collection extends ''
    ? 'setEntitiesPagedResult'
    : `set${Capitalize<Collection>}EntitiesPagedResult`;

/**
 * The result fetchEntities returns, when the store has an entities pagination
 * feature it is whatever its set[Collection]EntitiesPagedResult accepts, which
 * varies per pagination feature, e.g. { entities, total } for
 * withEntitiesRemotePagination, otherwise the plain entities result.
 */
export type FetchEntitiesResult<
  Input extends SignalStoreFeatureResult,
  Collection extends string,
  Entity,
> =
  Input['methods'] extends NamedSetEntitiesResult<Collection, infer ResultParam>
    ? ResultParam
    : Entity[] | { entities: Entity[] };

/**
 * Adds an unreachable member to the result type, its key explains why the
 * result has that shape, so a wrong result reports
 *
 * Type 'Observable<Product[]>' is not assignable to type
 * 'Observable<PagedFetchEntitiesResult<{ entities: Product[]; total: number },
 * "the store has an entities pagination feature, fetchEntities must return the
 * result setEntitiesPagedResult accepts">>'
 *
 * instead of only naming the properties that are missing.
 */
export type PagedFetchEntitiesResult<ResultParam, Explanation extends string> =
  | ResultParam
  | { [K in Explanation]: never };

/**
 * Same as FetchEntitiesResult, but explaining where the shape comes from when
 * the store has an entities pagination feature. Only for the value fetchEntities
 * returns, results handed back to the user, like the onSuccess param, use
 * FetchEntitiesResult so they don't have to narrow the explanation away.
 */
export type ExpectedFetchEntitiesResult<
  Input extends SignalStoreFeatureResult,
  Collection extends string,
  Entity,
> =
  Input['methods'] extends NamedSetEntitiesResult<Collection, infer ResultParam>
    ? PagedFetchEntitiesResult<
        ResultParam,
        `the store has an entities pagination feature, fetchEntities must return the result ${SetEntitiesPagedResultKey<Collection>} accepts`
      >
    : Entity[] | { entities: Entity[] };
