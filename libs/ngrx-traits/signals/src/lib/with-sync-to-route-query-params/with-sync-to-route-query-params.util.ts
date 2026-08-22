import { computed, isDevMode, Signal } from '@angular/core';
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
  | 'string-array'
  | 'number-array'
  | 'json';

/**
 * The type that can be declared for a state prop holding T, so only the valid
 * ones are suggested and a wrong one fails on the prop itself. Null and
 * undefined are stripped so optional props can be synced too.
 *
 * Each kind of value gets exactly one type, except dates which choose how much
 * of the date to keep in the url, and objects which either travel as 'json' or
 * are described field by field with a nested props object of the same shape.
 * 'json' is not offered as an alternative for the primitives because it writes
 * the same url while validating less on the way back, so '?flag=123' would put
 * a number in a boolean prop, and not for dates because JSON.parse gives back a
 * string, not a Date. An array of strings or of numbers can travel as a comma
 * separated list instead of json, anything else in an array only takes 'json'.
 */
type QueryParamTypeFor<T> = 0 extends 1 & T
  ? // an any typed prop matches every branch below, so let it pick any type
    QueryParamType | Record<string, any>
  : [NonNullable<T>] extends [Date]
    ? 'date' | 'date-time' | 'time'
    : [NonNullable<T>] extends [boolean]
      ? 'boolean'
      : [NonNullable<T>] extends [string]
        ? 'string'
        : [NonNullable<T>] extends [number]
          ? 'number'
          : [NonNullable<T>] extends [readonly string[]]
            ? 'json' | 'string-array'
            : [NonNullable<T>] extends [readonly number[]]
              ? 'json' | 'number-array'
              : [NonNullable<T>] extends [readonly any[]]
                ? 'json'
                : [NonNullable<T>] extends [object]
                  ? 'json' | QueryParamTypesFor<NonNullable<T>>
                  : 'json';

/**
 * The props object shape for a given store state, every state prop is optional
 * and can only be declared as one of the types that fits its value, or as a
 * nested props object when it holds one.
 */
type QueryParamTypesFor<State> = {
  [K in keyof State]?: QueryParamTypeFor<State[K]>;
};

/**
 * The query param names a props object produces, a prop declared with a nested
 * props object becomes one param per leaf, named with the path to it joined by
 * dots.
 */
type QueryParamNames<Props> = {
  [K in keyof Props & string]: Props[K] extends QueryParamType
    ? K
    : `${K}.${QueryParamNames<Props[K]>}`;
}[keyof Props & string];

/**
 * Fails on the props that are not in the state, at every level. The names are
 * autocompleted from QueryParamTypesFor but not checked against it, because the
 * state is still being inferred while the props object is read, which is what
 * turns the excess property check off. Mapping every key to the type it is
 * allowed to have, or to a message when the state does not have it, checks them
 * once the state is known.
 */
type OnlyStateProps<Props, State> = {
  [K in keyof Props]: K extends keyof State
    ? Props[K] extends QueryParamType
      ? QueryParamTypeFor<State[K]>
      : OnlyStateProps<Props[K], NonNullable<State[K]>>
    : `'${K & string}' is not a prop of the state`;
};

type PropsTree = { [key: string]: QueryParamType | PropsTree };

/**
 * Turns a props object into one entry per leaf, keeping the path to each one,
 * so a nested prop becomes the query param 'filter.color' and can be read back
 * into the right place.
 */
function flattenProps(
  props: PropsTree,
  path: string[] = [],
): [string[], QueryParamType][] {
  return Object.entries(props).reduce(
    (acc, [key, value]) =>
      typeof value === 'string'
        ? [...acc, [[...path, key], value] as [string[], QueryParamType]]
        : [...acc, ...flattenProps(value, [...path, key])],
    [] as [string[], QueryParamType][],
  );
}

/**
 * Reads the value at a path, undefined as soon as the path runs into nothing.
 */
function getIn(value: unknown, path: string[]): unknown {
  return path.reduce<any>(
    (acc, key) => (acc === undefined || acc === null ? undefined : acc[key]),
    value,
  );
}

/**
 * Returns a copy of value with the path set. The objects along the way are
 * copied instead of mutated, and the fields the path does not touch are kept,
 * so the ones a props object does not declare survive the round trip.
 */
function setIn(value: unknown, path: string[], leaf: unknown): unknown {
  const [key, ...rest] = path;
  const base =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  return {
    ...base,
    [key]: rest.length ? setIn(base[key], rest, leaf) : leaf,
  };
}

/**
 * Creates a QueryMapper that syncs state props to query params with the same
 * name, using the declared type of each prop to serialize and deserialize it.
 *
 * The prop names come from the state of the store the
 * withSyncToRouteQueryParams feature is added to, so they autocomplete, and
 * each prop only accepts the types that fit its value, so declaring
 * `page: 'string'` for a numeric prop, or a prop the state does not have, is a
 * compile error, at every level of a nested props object.
 *
 * Only 'json' props go through JSON.stringify, the rest are written in their
 * plain form so urls stay readable. Date props pick how much of the date to
 * keep, 'date' writes 2026-08-11, 'date-time' writes an iso timestamp and
 * 'time' writes 09:30, all in local time except 'date-time'. An array of
 * strings or of numbers can be written as a comma separated list with
 * 'string-array' or 'number-array', so ?tags=shoes,boots. The comma is the
 * separator, so a string carrying one comes back split in two, use 'json' for
 * those, in dev mode a warning is logged when it happens.
 *
 * A prop holding an object can be declared as 'json' to travel as a single
 * param, or described field by field with a nested props object, which gives
 * it one param per field named with the path to it, so `filter.color=red`. The
 * fields left undeclared keep the value they have in the store, they are
 * neither written to the url nor cleared when it is read back.
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
 *         tags: ['shoes'],
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
 *             tags: 'string-array',
 *             filter: 'json',
 *           }),
 *         ],
 *       }),
 *     );
 *     // ?search=shoes&page=2&showSold=true&day=2026-08-11
 *     //  &startsAt=2026-08-11T09:30:00.000Z&tags=shoes,boots
 *     //  &filter=%7B%22color%22%3A%22red%22%2C%22size%22%3A10%7D
 *
 * @example
 *     // the same filter prop described field by field instead, which keeps the
 *     // url readable and brings back a real Date rather than the string
 *     // JSON.parse would give
 *     const Store = signalStore(
 *       withState({
 *         filter: { color: 'red', size: 10, from: new Date() },
 *       }),
 *       withSyncToRouteQueryParams({
 *         mappers: [
 *           getQueryMapperForState({
 *             filter: { color: 'string', from: 'date' },
 *           }),
 *         ],
 *       }),
 *     );
 *     // ?filter.color=red&filter.from=2026-08-11
 *     // size is not declared, so it stays at whatever the store holds
 */
export function getQueryMapperForState<
  Input extends SignalStoreFeatureResult,
  const Props extends QueryParamTypesFor<Input['state']> &
    OnlyStateProps<Props, Input['state']>,
>(
  props: Props,
): QueryMapper<
  Partial<Record<QueryParamNames<Props>, string>>,
  Record<string, any>,
  Input
> {
  const entries = flattenProps(props as PropsTree);
  return {
    queryParamsToState: (query, store) => {
      const params = query as Record<string, string | undefined>;
      const signals = store as unknown as Record<string, Signal<unknown>>;
      const state = entries.reduce(
        (acc, [path, propType]) => {
          const value = params[path.join('.')];
          if (value === undefined) return acc;
          const parsed = deserializeQueryParam(value, propType);
          if (!parsed) return acc;
          const [prop, ...rest] = path;
          acc[prop] = rest.length
            ? // merged over the value the prop already holds, patchState only
              // replaces whole props, so the fields this mapper does not
              // declare would be dropped otherwise
              setIn(
                prop in acc ? acc[prop] : signals[prop]?.(),
                rest,
                parsed.value,
              )
            : parsed.value;
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
            (acc, [path, propType]) => {
              const [prop, ...rest] = path;
              acc[path.join('.')] = serializeQueryParam(
                getIn(signals[prop](), rest),
                propType,
                path.join('.'),
              );
              return acc;
            },
            {} as Record<string, string | undefined>,
          ) as Partial<Record<QueryParamNames<Props>, string>>,
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
 * A field holding an object can be described field by field too, with a nested
 * props object, which gives it one param per field named with the path to it,
 * so `range.from=2026-08-11`.
 *
 * A field that is undefined or null is removed from the url. On the way back
 * the mapper patches the filter instead of replacing it, so the fields it does
 * not declare keep their value, the ones at the top level and the ones inside
 * a declared object alike, while every declared field is restored, falling
 * back to the value the field has in the store defaultFilter when its param is
 * missing or does not match its type, or to the one the filter already holds
 * when defaultFilter says nothing about it. A bare url therefore restores the
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
 *
 * @example
 *     type ProductFilter = {
 *       search: string;
 *       range: { from: Date; to: Date };
 *     };
 *
 *     withEntitiesSyncToRouteQueryParams({
 *       entity,
 *       collection,
 *       filterMapper: getFilterQueryMapper<ProductFilter>({
 *         search: 'string',
 *         range: { from: 'date', to: 'date' },
 *       }),
 *     });
 *     // ?product-search=shoes&product-range.from=2026-08-11
 *     //  &product-range.to=2026-08-31
 */
export function getFilterQueryMapper<
  Filter extends Record<string, any>,
  const Props extends QueryParamTypesFor<Filter> = QueryParamTypesFor<Filter>,
>(props: Props): FilterQueryMapper<Filter> {
  const entries = flattenProps(props as PropsTree);
  return {
    // the filter is merged, so the fields this mapper does not declare survive
    patch: true,
    queryParamsToFilter: (query, defaultFilter, currentFilter) => {
      const params = query as Record<string, string | undefined>;
      return entries.reduce(
        (acc, [path, propType]) => {
          const value = params[path.join('.')];
          const parsed =
            value === undefined
              ? undefined
              : deserializeQueryParam(value, propType);
          // every declared field is written, one whose param is missing or
          // unparsable falls back to its default rather than to undefined,
          // which would hand a filterFn a field it does not expect to be empty.
          // the default comes first so a bare url restores the declared fields
          // to it, the current value is only there for the fields defaultFilter
          // says nothing about
          const leaf = parsed
            ? parsed.value
            : getIn(defaultFilter, path) ?? getIn(currentFilter, path);
          const [prop, ...rest] = path;
          acc[prop] = rest.length
            ? // the filter is only merged field by field at the top level, so
              // a nested field this mapper does not declare is kept by seeding
              // the object with the one the store holds, the same way the state
              // mapper seeds from the prop it is about to patch
              setIn(
                prop in acc
                  ? acc[prop]
                  : getIn(currentFilter, [prop]) ?? defaultFilter?.[prop],
                rest,
                leaf,
              )
            : leaf;
          return acc;
        },
        {} as Record<string, unknown>,
      ) as Filter;
    },
    filterToQueryParams: (filter) =>
      entries.reduce(
        (acc, [path, propType]) => {
          acc[path.join('.')] = serializeQueryParam(
            getIn(filter, path),
            propType,
            path.join('.'),
          );
          return acc;
        },
        {} as Record<string, string | undefined>,
      ),
  };
}

function serializeQueryParam(
  value: unknown,
  type: QueryParamType,
  name?: string,
): string | undefined {
  // undefined removes the param from the url, null is treated the same so a
  // cleared prop does not end up as the string 'null' in the url
  if (value === undefined || value === null) return undefined;
  switch (type) {
    case 'json':
      return JSON.stringify(value);
    case 'string-array':
    case 'number-array':
      if (!Array.isArray(value)) return String(value);
      if (
        isDevMode() &&
        type === 'string-array' &&
        value.some((item) => `${item}`.includes(','))
      ) {
        // the comma is the separator, so the value would silently come back
        // split in two, which is worth saying out loud rather than debugging.
        // dev mode only, this runs on every write of the param
        console.warn(
          `[withSyncToRouteQueryParams] the value of ${
            name ? `'${name}'` : 'a string-array prop'
          } contains a comma, it will be read back as two entries, declare the prop as 'json' instead`,
        );
      }
      // an empty array still writes the param, as an empty value, dropping it
      // would read back as 'the url does not carry this prop' instead
      return value.join(',');
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
  // a repeated param, ?tags=a&tags=b, is handed over as an array, and there is
  // no telling which entry was meant, so it is skipped like any other value
  // that does not match its declared type. without this the string methods
  // below throw, and the throw takes the whole restore with it, the mappers
  // after this one never run
  if (typeof value !== 'string') return undefined;
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
    case 'string-array':
      return { value: value === '' ? [] : value.split(',') };
    case 'number-array': {
      if (value === '') return { value: [] };
      const items = value.split(',');
      // an empty element would read as 0, the same way '?page=' is rejected
      // for a number prop rather than restored as one
      if (items.some((item) => item.trim() === '')) return undefined;
      const parsed = items.map(Number);
      // one bad element skips the whole param, half an array is worse than the
      // one the prop already holds
      return parsed.some((item) => Number.isNaN(item))
        ? undefined
        : { value: parsed };
    }
    case 'json':
      try {
        return { value: JSON.parse(value) };
      } catch {
        return undefined;
      }
  }
}
