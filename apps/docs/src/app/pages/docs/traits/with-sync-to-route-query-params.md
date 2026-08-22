---
name: withSyncToRouteQueryParams
order: 18
---

# withSyncToRouteQueryParams

Syncs the route query params with the store and back. On init it will load
the query params once and set them in the store using the mapper.queryParamsToState, after that
and change on the store will be reflected in the query params using the mapper.stateToQueryParams

## Import

Import the withSyncToRouteQueryParams trait from `@ngrx-traits/signals`.

```ts
import { getQueryMapperForState, withSyncToRouteQueryParams } from '@ngrx-traits/signals';
```

## Examples

### Sync state props with getQueryMapperForState

Most of the time a mapper only needs to move a few state props in and out of the url. `getQueryMapperForState` generates that mapper from an object of props to their type, so you do not write the serialization by hand.

```typescript
const Store = signalStore(
  withState({
    search: '',
    page: 0,
    showSold: false,
    day: new Date(),
    startsAt: new Date(),
    filter: { color: 'red', size: 10 },
  }),
  withSyncToRouteQueryParams({
    mappers: [
      getQueryMapperForState({
        search: 'string',
        page: 'number',
        showSold: 'boolean',
        day: 'date',
        startsAt: 'date-time',
        filter: 'json',
      }),
    ],
  }),
);
```

Which gives a url like:

```
?search=shoes&page=2&showSold=true&day=2026-08-11&startsAt=2026-08-11T09:30:00.000Z&filter=%7B%22color%22%3A%22red%22%2C%22size%22%3A10%7D
```

The prop names come from the state of the store the feature is added to, so they autocomplete, and each prop only accepts the types that fit its value. Declaring `page: 'string'` for a numeric prop, or a prop that is not in the state, is a compile error, and so is the same mistake inside a nested props object.

### Available types

| Type            | Use for                       | In the url                              |
| --------------- | ----------------------------- | --------------------------------------- |
| `'string'`      | string props                  | `?search=shoes`                         |
| `'number'`      | number props                  | `?page=2`                               |
| `'boolean'`     | boolean props                 | `?showSold=true`                        |
| `'date'`        | Date props                    | `?day=2026-08-11`                       |
| `'date-time'`   | Date props                    | `?startsAt=2026-08-11T09:30:00.000Z`    |
| `'time'`        | Date props                    | `?at=09:30`                             |
| `'string-array'`| string[] props                | `?tags=shoes,boots`                     |
| `'number-array'`| number[] props                | `?ids=1,2,3`                            |
| `'json'`        | objects and arrays            | `?filter=%7B%22color%22%3A%22red%22%7D` |
| `{ field: ... }`| objects, described field by field | `?filter.color=red`                 |

Only `'json'` props go through `JSON.stringify`, the rest are written in their plain form so the url stays readable. `'json'` is not offered for primitives, it would write the same url while accepting more on the way back, so `?showSold=123` could put a number in a boolean prop.

A `Date` prop picks how much of the date to keep. `'date'` and `'time'` are written in local time, so a day picked as the 11th does not travel as the 10th for anyone west of Greenwich, while `'date-time'` writes a full iso timestamp in UTC. A `'time'` param has no day to sit on, so it is restored onto the epoch date, `1970-01-01`.

An array of strings or of numbers can travel as a comma separated list with `'string-array'` or `'number-array'`, which reads better than the json version of the same prop, `?tags=shoes,boots` instead of `?tags=%5B%22shoes%22%2C%22boots%22%5D`. Both keep the param when the array is empty, written as `?tags=`, so an empty array is restored as one instead of reading back as a prop the url does not carry. A `'number-array'` param with an element that is not a number is skipped whole, half an array is worse than the one the prop already holds.

A `'string-array'` prop must not hold values with a comma in them. The comma is the separator, so `['a,b']` is written as `?tags=a,b` and read back as `['a', 'b']`, silently. Escaping it is not worth it, the router encodes the value again so it would surface in the url as `%252C`, which defeats the point of a readable list. Declare the prop as `'json'` when its values can carry commas. In dev mode a warning is logged naming the prop when one is written, in production the check is skipped.

Arrays of anything else only take `'json'`, a props object has no way to describe their elements.

### Describing an object field by field

A prop holding an object can travel as `'json'`, or be described with a nested props object of the same shape, which gives it one param per field named with the path to it:

```typescript
const Store = signalStore(
  withState({
    filter: { color: 'red', size: 10, from: new Date() },
  }),
  withSyncToRouteQueryParams({
    mappers: [
      getQueryMapperForState({
        filter: { color: 'string', from: 'date' },
      }),
    ],
  }),
);
```

```
?filter.color=red&filter.from=2026-08-11
```

Instead of the `'json'` version of the same prop:

```
?filter=%7B%22color%22%3A%22red%22%2C%22from%22%3A%222026-08-11T00%3A00%3A00.000Z%22%7D
```

Besides the shorter url, the fields keep their types on the way back. `from` above is restored as a `Date`, while `JSON.parse` would have given back the string it was serialized to.

Nesting goes as deep as the object does, `{ range: { from: 'date' } }` becomes `?range.from=2026-08-11`, and the field names and types are checked at every level.

The fields you leave undeclared, `size` above, are neither written to the url nor touched when it is read back, they keep the value the store has. That is what makes a partial declaration safe, the object is merged rather than replaced.

### How values that do not fit are handled

| Case                                                                  | What happens                                   |
| --------------------------------------------------------------------- | ---------------------------------------------- |
| The prop is `undefined` or `null`                                     | The param is removed from the url              |
| The param is missing from the url                                     | The prop is left untouched in the store        |
| The param does not match its type, `?page=abc` from a hand edited url | The param is skipped, the prop keeps its value |
| A nested field is left undeclared                                     | It is not written to the url, and keeps its value when the url is read back |
| A nested param is present but the prop holds nothing yet              | The object is built from the params that are there |

### Restoring on demand instead of on init

Set `restoreOnInit: false` to keep the store from reading the url on init, and call `loadFromQueryParams()` when you are ready.

```typescript
const Store = signalStore(
  withState({ search: '', page: 0 }),
  withSyncToRouteQueryParams({
    mappers: [getQueryMapperForState({ search: 'string', page: 'number' })],
    restoreOnInit: false,
    // called every time the query params are stored in the state
    onQueryParamsStored: (store) => store.loadProducts(),
  }),
);

// later
store.loadFromQueryParams();
```

### Writing a mapper by hand

For anything the generated mapper does not cover, like renaming a param or splitting one param over several props, pass a mapper object instead. Both kinds can be mixed in the same `mappers` array.

```typescript
const Store = signalStore(
  withState({
    test: 'test',
    foo: 'foo',
    bar: false,
  }),
  withSyncToRouteQueryParams({
    mappers: [
      {
        queryParamsToState: (query, store) => {
          // set the query params in the store (only called once on init)
          patchState(store, {
            test: query.test,
            foo: query.foo,
            bar: query.bar === 'true',
          });
        },
        stateToQueryParams: (store) =>
          // return the query params to be set in the route
          computed(() => ({
            test: store.test(),
            foo: store.foo(),
            bar: store.bar().toString(),
          })),
      },
    ],
    defaultDebounce: debounce,
  }),
);
```

## API Reference

| Property            | Description                                                                          | Value                 |
| ------------------- | ------------------------------------------------------------------------------------ | --------------------- |
| mappers             | Query Mappers to transform one or more query parameters from and to the state        | QueryMapper[]         |
| defaultDebounce     | Debounce time before store changes are pushed back to the query params. Default: 300 | number (milliseconds) |
| restoreOnInit       | Read the query params into the store on init. Default: true                          | boolean               |
| onQueryParamsStored | Callback executed after the query params are stored in the state                     | `(store) => void`     |

### getQueryMapperForState

| Property | Description                                                                                        | Value                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| props    | The state props to sync, mapped to their type. Names and types are checked against the store state | `{ [prop]: 'string' \| 'number' \| 'boolean' \| 'date' \| 'date-time' \| 'time' \| 'json' }` |

## State

Generates no extra state

## Computed

Generates no extra computed signals

## Methods

| Property            | Description                                                                | Value        |
| ------------------- | -------------------------------------------------------------------------- | ------------ |
| loadFromQueryParams | Reads the current query params into the store using the configured mappers | `() => void` |
