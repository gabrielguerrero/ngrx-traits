import { computed, Signal } from '@angular/core';
import { Params } from '@angular/router';
import { patchState, SignalStoreFeatureResult } from '@ngrx/signals';

// type only, so it does not create a cycle with with-entities-filter.util which
// imports QueryMapper from here
import type { FilterQueryMapper } from '../with-entities-filter/with-entities-filter.util';

export type QueryMapper<
  T extends Params = Params,
  Store extends Record<string, any> = Record<string, any>,
  Input extends SignalStoreFeatureResult = SignalStoreFeatureResult,
> = {
  /**
   * @param firstLoad true only for the first query params emission restored
   *   into this store instance. Mappers should only read it, the caller resets
   *   it once all mappers have run.
   */
  queryParamsToState: (query: T, store: Store, firstLoad: boolean) => void;
  stateToQueryParams: (store: Store) => Signal<T> | undefined | null;
};

/**
 * The kind of value a state prop holds, it decides how the prop is written to
 * and read back from the query params.
 */
export type QueryParamType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'date-time'
  | 'time'
  | 'json';

/**
 * The type that can be declared for a state prop holding T, so only the valid
 * ones are suggested and a wrong one fails on the prop itself. Null and
 * undefined are stripped so optional props can be synced too.
 *
 * Each kind of value gets exactly one type, except dates which choose how much
 * of the date to keep in the url, and 'json' is left for objects and arrays. It
 * is not offered as an alternative for the primitives because it writes the
 * same url while validating less on the way back, so '?flag=123' would put a
 * number in a boolean prop, and not for dates because JSON.parse gives back a
 * string, not a Date.
 */
type QueryParamTypeFor<T> = 0 extends 1 & T
  ? // an any typed prop matches every branch below, so let it pick any type
    QueryParamType
  : [NonNullable<T>] extends [Date]
    ? 'date' | 'date-time' | 'time'
    : [NonNullable<T>] extends [boolean]
      ? 'boolean'
      : [NonNullable<T>] extends [string]
        ? 'string'
        : [NonNullable<T>] extends [number]
          ? 'number'
          : 'json';

/**
 * The props object shape for a given store state, every state prop is optional
 * and can only be declared as one of the types that fits its value.
 */
type QueryParamTypesFor<State> = {
  [K in keyof State]?: QueryParamTypeFor<State[K]>;
};

/**
 * Creates a QueryMapper that syncs state props to query params with the same
 * name, using the declared type of each prop to serialize and deserialize it.
 *
 * The prop names come from the state of the store the
 * withSyncToRouteQueryParams feature is added to, so they autocomplete, and
 * each prop only accepts the types that fit its value, so declaring
 * `page: 'string'` for a numeric prop is a compile error.
 *
 * Only 'json' props go through JSON.stringify, the rest are written in their
 * plain form so urls stay readable. Date props pick how much of the date to
 * keep, 'date' writes 2026-08-11, 'date-time' writes an iso timestamp and
 * 'time' writes 09:30, all in local time except 'date-time'.
 *
 * A prop that is undefined or null is removed from the url, a param missing
 * from the url is left untouched in the store, and a param that does not match
 * its declared type (a hand edited url) is skipped instead of writing a wrong
 * value into the state.
 *
 * @param props - the state props to sync, mapped to their type
 *
 * @example
 *     const Store = signalStore(
 *       withState({
 *         search: '',
 *         page: 0,
 *         showSold: false,
 *         day: new Date(),
 *         startsAt: new Date(),
 *         filter: { color: 'red', size: 10 },
 *       }),
 *       withSyncToRouteQueryParams({
 *         mappers: [
 *           getQueryMapperForState({
 *             search: 'string',
 *             page: 'number',
 *             showSold: 'boolean',
 *             day: 'date',
 *             startsAt: 'date-time',
 *             filter: 'json',
 *           }),
 *         ],
 *       }),
 *     );
 *     // ?search=shoes&page=2&showSold=true&day=2026-08-11
 *     //  &startsAt=2026-08-11T09:30:00.000Z
 *     //  &filter=%7B%22color%22%3A%22red%22%2C%22size%22%3A10%7D
 */
export function getQueryMapperForState<
  Input extends SignalStoreFeatureResult,
  const Props extends QueryParamTypesFor<Input['state']>,
>(
  props: Props,
): QueryMapper<
  Partial<Record<keyof Props & string, string>>,
  Record<string, any>,
  Input
> {
  const entries = Object.entries(props) as [string, QueryParamType][];
  return {
    queryParamsToState: (query, store) => {
      const params = query as Record<string, string | undefined>;
      const state = entries.reduce(
        (acc, [prop, propType]) => {
          const value = params[prop];
          if (value === undefined) return acc;
          const parsed = deserializeQueryParam(value, propType);
          if (parsed) acc[prop] = parsed.value;
          return acc;
        },
        {} as Record<string, unknown>,
      );
      if (Object.keys(state).length) {
        patchState(store as any, state);
      }
    },
    stateToQueryParams: (store) => {
      const signals = store as unknown as Record<string, Signal<unknown>>;
      return computed(
        () =>
          entries.reduce(
            (acc, [prop, propType]) => {
              acc[prop] = serializeQueryParam(signals[prop](), propType);
              return acc;
            },
            {} as Record<string, string | undefined>,
          ) as Partial<Record<keyof Props & string, string>>,
      );
    },
  };
}

/**
 * Creates a FilterQueryMapper for the filterMapper option of
 * withEntitiesSyncToRouteQueryParams and getQueryMapperForEntitiesFilter, using
 * the same types as getQueryMapperForState. It spreads the filter over one
 * query param per field instead of the default single json blob, so the url
 * reads as ?search=shoes&maxPrice=100 instead of ?filter=%7B%22search%22...
 *
 * The filter type cannot be inferred from the store, so it has to be given,
 * which is what makes the field names autocomplete and their types check.
 *
 * A field that is undefined or null is removed from the url. On the way back
 * the mapper patches the filter instead of replacing it, so fields it does not
 * declare keep their value, while every declared field is restored, falling
 * back to the value the field has in the store defaultFilter when its param is
 * missing or does not match its type. A bare url therefore restores the
 * declared fields to their defaults, which is also what makes the back button
 * work after clearing a filter.
 *
 * The flip side of leaning on defaultFilter is that a field cannot travel as
 * cleared unless its default already is, restoring a url without its param
 * brings the default back rather than an empty value.
 *
 * @param props - the filter fields to sync, mapped to their type
 *
 * @example
 *     type ProductFilter = { search: string; maxPrice: number; from: Date };
 *
 *     withEntitiesSyncToRouteQueryParams({
 *       entity,
 *       collection,
 *       filterMapper: getFilterQueryMapper<ProductFilter>({
 *         search: 'string',
 *         maxPrice: 'number',
 *         from: 'date',
 *       }),
 *     });
 *     // ?product-search=shoes&product-maxPrice=100&product-from=2026-08-11
 */
export function getFilterQueryMapper<
  Filter extends Record<string, any>,
  const Props extends QueryParamTypesFor<Filter> = QueryParamTypesFor<Filter>,
>(props: Props): FilterQueryMapper<Filter> {
  const entries = Object.entries(props) as [string, QueryParamType][];
  return {
    // the filter is merged, so the fields this mapper does not declare survive
    patch: true,
    queryParamsToFilter: (query, defaultFilter) => {
      const params = query as Record<string, string | undefined>;
      return entries.reduce(
        (acc, [prop, propType]) => {
          const value = params[prop];
          const parsed =
            value === undefined
              ? undefined
              : deserializeQueryParam(value, propType);
          // every declared field is written, one whose param is missing or
          // unparsable falls back to its default rather than to undefined,
          // which would hand a filterFn a field it does not expect to be empty
          acc[prop] = parsed ? parsed.value : defaultFilter?.[prop];
          return acc;
        },
        {} as Record<string, unknown>,
      ) as Filter;
    },
    filterToQueryParams: (filter) =>
      entries.reduce(
        (acc, [prop, propType]) => {
          acc[prop] = serializeQueryParam(filter?.[prop], propType);
          return acc;
        },
        {} as Record<string, string | undefined>,
      ),
  };
}

function serializeQueryParam(
  value: unknown,
  type: QueryParamType,
): string | undefined {
  // undefined removes the param from the url, null is treated the same so a
  // cleared prop does not end up as the string 'null' in the url
  if (value === undefined || value === null) return undefined;
  switch (type) {
    case 'json':
      return JSON.stringify(value);
    case 'date':
      // the local date, not the utc one, so a date picked as the 11th does not
      // travel as the 10th for anyone west of greenwich
      return value instanceof Date
        ? `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(
            value.getDate(),
          )}`
        : String(value);
    case 'date-time':
      return value instanceof Date ? value.toISOString() : String(value);
    case 'time': {
      if (!(value instanceof Date)) return String(value);
      const time = `${pad(value.getHours())}:${pad(value.getMinutes())}`;
      // seconds are only written when they carry something
      return value.getSeconds() ? `${time}:${pad(value.getSeconds())}` : time;
    }
    default:
      return String(value);
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Returns the parsed value wrapped in an object, or undefined when the param
 * does not match its declared type, which is the signal to leave the prop
 * alone. The wrapper is what tells 'parsed to undefined' apart from 'skip'.
 */
function deserializeQueryParam(
  value: string,
  type: QueryParamType,
): { value: unknown } | undefined {
  switch (type) {
    case 'string':
      return { value };
    case 'number': {
      if (value.trim() === '') return undefined;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : { value: parsed };
    }
    case 'boolean':
      if (value === 'true') return { value: true };
      if (value === 'false') return { value: false };
      return undefined;
    case 'date': {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
      if (!match) return undefined;
      const [, year, month, day] = match.map(Number);
      // built from the parts so it lands on local midnight, new Date('2026-08-11')
      // would parse as utc and shift the day
      const parsed = new Date(year, month - 1, day);
      // rejects the likes of 2026-02-31, which Date would roll over to march
      return parsed.getMonth() === month - 1 && parsed.getDate() === day
        ? { value: parsed }
        : undefined;
    }
    case 'date-time': {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? undefined : { value: parsed };
    }
    case 'time': {
      const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
      if (!match) return undefined;
      const hours = Number(match[1]);
      const minutes = Number(match[2]);
      const seconds = match[3] ? Number(match[3]) : 0;
      if (hours > 23 || minutes > 59 || seconds > 59) return undefined;
      // a time on its own has no day to sit on, so it lands on the epoch date
      return { value: new Date(1970, 0, 1, hours, minutes, seconds) };
    }
    case 'json':
      try {
        return { value: JSON.parse(value) };
      } catch {
        return undefined;
      }
  }
}
