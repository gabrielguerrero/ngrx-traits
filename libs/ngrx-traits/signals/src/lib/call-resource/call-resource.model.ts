import { ResourceStatus, Signal } from '@angular/core';

import { CallStatus } from '../with-call-status/with-call-status.model';

/**
 * The statuses a call resource reports: Angular's `ResourceStatus` without
 * `'local'`, which only applies to a resource holding its own value.
 */
export type CallResourceStatus = Exclude<ResourceStatus, 'local'>;

/**
 * The `snapshot` of a call resource, same shape as Angular's `ResourceSnapshot`
 * with the error typed by the call.
 */
export type CallResourceSnapshot<T, Error = unknown> =
  | { readonly status: 'idle'; readonly value: T }
  | { readonly status: 'loading' | 'reloading'; readonly value: T }
  | { readonly status: 'resolved'; readonly value: T }
  | { readonly status: 'error'; readonly error: Error };

/**
 * A read-only view of a call tracked in the store, with the shape of Angular's
 * `Resource<T>`. Every signal reads the store: nothing is copied.
 *
 * It is structurally an Angular `Resource<T>` whenever `Error` extends the
 * built-in `Error`, so it can be handed to any API that takes one. The error is
 * typed by the call (see `mapError`) instead of being widened to `Error`.
 *
 * Differences with a resource created by Angular's `resource()`:
 * - `value()` never throws: when the call fails it keeps the last result, like
 *   `withPreviousValueOnError` from `@ngrx/signals/resource`.
 * - `'local'` is never reported, and the view is read-only. The result lives
 *   in the store, where every view of the call and every generated signal
 *   reads it, so writing it belongs in a store method and the status of what
 *   it wrote is `'resolved'`, like any other value the store holds.
 * - there is no `reload()`. The call is triggered by the store, which already
 *   exposes what runs it: the generated method for a `withCalls` call, or
 *   `set[Collection]Loading()` for `withEntitiesLoadingCall`.
 */
export interface CallResource<T, Error = unknown> {
  /**
   * The result of the call, as stored in the store.
   */
  readonly value: Signal<T>;
  /**
   * The store call status mapped to Angular's `ResourceStatus`:
   * - `'init'` → `'idle'`
   * - `'loading'` → `'loading'` the first time, `'reloading'` once the call
   *   has produced a value
   * - `'loaded'` → `'resolved'`
   * - `{ error }` → `'error'`
   */
  readonly status: Signal<CallResourceStatus>;
  /**
   * The error of the last call, `undefined` while not in the `error` state.
   */
  readonly error: Signal<Error | undefined>;
  /**
   * Whether the call is loading or reloading.
   */
  readonly isLoading: Signal<boolean>;
  /**
   * Status and value (or error) in one object, like Angular's `ResourceSnapshot`.
   */
  readonly snapshot: Signal<CallResourceSnapshot<T, Error>>;
  /**
   * Whether there is a value to show: the value is not `undefined` and the
   * call is not in the `error` state. Narrows `value` to exclude `undefined`.
   */
  hasValue(
    this: T extends undefined ? this : never,
  ): this is CallResource<Exclude<T, undefined>, Error>;
  hasValue(): boolean;
  /**
   * Stops the `params` signal or observable from driving the call, when one
   * was given. The store keeps tracking the call; only this view stops
   * feeding it.
   */
  destroy(): void;
}

/**
 * What a store feature provides to `createCallResource` to build a
 * `CallResource` over the call it tracks.
 */
export type CallResourceSource<T, Error = unknown> = {
  /** The signal holding the result of the call. */
  value: Signal<T>;
  /** The `<name>CallStatus` signal of the call. */
  callStatus: Signal<CallStatus>;
  /** The `<name>Error` signal of the call. */
  error: Signal<Error | undefined>;
  /** The `is<Name>Loading` signal of the call. */
  isLoading: Signal<boolean>;
  /**
   * Whether the call has produced a value at least once. A latch: it stays
   * true across later loads and errors, which is what makes it different
   * from `is<Name>Loaded`, the current status, false during a refresh.
   *
   * It is what tells a `reloading` from a first `loading`, since neither the
   * status nor `is<Name>Loaded` can: both say the call is loading at that
   * point. The feature sets it when the call completes, and when it builds a
   * view over a status the store was already given, so a state hydrated from
   * the server or from storage counts as loaded.
   *
   * It has to be tracked rather than derived, since deriving it from the
   * status would only see the transitions that something happened to read.
   *
   * Defaults to the value not being `undefined`, which is enough unless the
   * result can legitimately be `undefined`, or is never `undefined` (an
   * entities collection starts as an empty array, and `defaultResult` seeds
   * the result of a call).
   */
  hasLoadedOnce?: Signal<boolean>;
  /** Tears down whatever the view set up, if anything. */
  destroy?: () => void;
};
