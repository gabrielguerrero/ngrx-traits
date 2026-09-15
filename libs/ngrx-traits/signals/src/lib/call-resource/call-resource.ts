import { computed } from '@angular/core';

import {
  CallResource,
  CallResourceSnapshot,
  CallResourceSource,
  CallResourceStatus,
} from './call-resource.model';

/**
 * @experimental
 * Builds a `CallResource` over a call tracked in the store, the object the
 * `<resultProp>Resource()` method of `withCalls` and the
 * `<collection>EntitiesResource()` method of `withEntitiesLoadingCall` return.
 * Use it to give the same resource view to a call tracked by a custom feature
 * built on `withCallStatus`.
 *
 * Every signal reads the store, nothing is copied: `value` is the store signal
 * holding the result, `status` maps the store call status to Angular's
 * `ResourceStatus`, and `error` and `isLoading` are the store signals
 * themselves. The view is read-only, writing the result is a state change and
 * belongs in a store method, as does running the call again.
 *
 * @param source - The store signals of the call
 *
 * @example
 * withMethods((store) => ({
 *   userResource: () =>
 *     createCallResource({
 *       value: store.user,
 *       callStatus: store.userCallStatus,
 *       error: store.userError,
 *       isLoading: store.isUserLoading,
 *     }),
 * })),
 */
export function createCallResource<T, Error = unknown>(
  source: CallResourceSource<T, Error>,
): CallResource<T, Error> {
  const { value, callStatus, error, isLoading, hasLoadedOnce } = source;
  const status = computed<CallResourceStatus>(() => {
    const s = callStatus();
    if (s === 'init') return 'idle';
    if (s === 'loading')
      // 'reloading' once the call has produced a value, since it is replacing
      // something that is already on screen. Neither the status nor
      // is<Name>Loaded can tell, both say loading here, so the feature latches it
      return (hasLoadedOnce ? hasLoadedOnce() : value() !== undefined)
        ? 'reloading'
        : 'loading';
    if (s === 'loaded') return 'resolved';
    return 'error';
  });
  const snapshot = computed<CallResourceSnapshot<T, Error>>(() => {
    const s = status();
    if (s === 'error') return { status: s, error: error() as Error };
    return { status: s, value: value() };
  });

  return {
    value,
    status,
    error,
    isLoading,
    snapshot,
    hasValue: () => status() !== 'error' && value() !== undefined,
    destroy: () => source.destroy?.(),
  } as CallResource<T, Error>;
}
