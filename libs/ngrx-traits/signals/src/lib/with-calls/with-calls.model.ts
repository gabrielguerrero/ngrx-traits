import { Injector, Signal } from '@angular/core';
import { Observable } from 'rxjs';

import { CallResource } from '../call-resource/call-resource.model';

export type ObservableCall<Param = any, Result = any> =
  | (() => Observable<Result>)
  | ((arg: Param) => Observable<Result>);
export type PromiseCall<Param = any, Result = any> =
  | (() => Promise<Result>)
  | ((arg: Param) => Promise<Result>);
export type Call<Param = any, Result = any> =
  | ObservableCall<Param, Result>
  | PromiseCall<Param, Result>;
export type CallConfig<
  Param = any,
  Result = any,
  PropName extends string = string,
  Error = any,
  DefaultResult = any,
> = {
  /**
   * The main function to be called.
   */
  call: Call<Param, Result>;

  /**
   * The name of the property where the result of the call will be stored.
   */
  resultProp: PropName;

  /**
   * Specifies how to map emissions of the call, using one of the following:
   * - 'switchMap': Cancels the previous call when a new one starts.
   * - 'concatMap': Queues calls and executes them sequentially.
   * - 'exhaustMap': Ignores new calls until the current one completes.
   * Default is exhaustMap
   */
  mapPipe?: 'switchMap' | 'concatMap' | 'exhaustMap';

  /**
   * default is true, if false disables automatically storing the result of the
   * function, and removes the generated types.
   */
  storeResult?: boolean;

  /**
   * A default value for the result before the call is executed
   */
  defaultResult?: NoInfer<DefaultResult>;

  /**
   * Callback function invoked on successful completion of the call.
   * Receives the result of the call and the parameter used.
   */
  onSuccess?: (
    result: NoInfer<Result>,
    param: NoInfer<Param>,
    previousResult: NoInfer<Result> | undefined,
  ) => void;

  /**
   * A function to transform an error from the call into a custom `Error` type.
   * Receives the error and the parameter used.
   */
  mapError?: (error: unknown, param: NoInfer<Param>) => Error;

  /**
   * Callback function invoked if the call encounters an error.
   * Receives the mapped error and the parameter used.
   */
  onError?: (error: Error, param: NoInfer<Param>) => void;

  /**
   * A function with condition that determines whether the call should be skipped.
   * The function accepts the  call parameter and must return a boolean | Observable<boolean>.
   */
  skipWhen?: (
    param: NoInfer<Param>,
    previousResult: NoInfer<Result> | undefined,
  ) => boolean | Promise<boolean> | Observable<boolean>;

  /**
   * Reactively execute the call with the provided params.
   * Supports the following:
   * - A direct parameter value. Which execute the call once on init.
   * - A function or `Observable` emitting the parameter of the call or undefined.
   * - A function returning the parameter or undefined.
   *
   * **Warning**: By default, when withCall is a function, signal
   * or observable that when returns a falsy value it will skip the call.
   * To override this behavior, define a skipWhen with your own rule or skipWhen: () => false
   * to always execute on any value.
   */
  callWith?: Param extends undefined
    ? Observable<boolean> | (() => boolean) | boolean
    :
        | NoInfer<Param>
        | null
        | undefined
        | Observable<NoInfer<Param | null | undefined>>
        | (() => NoInfer<Param> | null | undefined);
};

export type ExtractCallResultPropName<
  K extends string | number | symbol,
  T extends Call | CallConfig,
> = T extends CallConfig
  ? T['storeResult'] extends false
    ? never
    : T['resultProp'] extends ''
      ? `${K & string}Result`
      : T['resultProp'] & string
  : `${K & string}Result`;

export type ExtractCallResultType<T extends Call | CallConfig> =
  T extends Call<any, infer R>
    ? R | undefined
    : T extends CallConfig<any, infer R, any, any, infer D>
      ? D extends undefined
        ? R | undefined
        : D
      : never;
export type ExtractErrorType<T extends Call | CallConfig> =
  T extends CallConfig<any, any, any, infer E> ? E : unknown;

export type NamedCallsStatusComputed<
  Calls extends Record<string, Call | CallConfig>,
> = {
  [K in keyof Calls as K extends `_${infer J}`
    ? `_is${Capitalize<string & J>}Loading`
    : `is${Capitalize<string & K>}Loading`]: Signal<boolean>;
} & {
  [K in keyof Calls as K extends `_${infer J}`
    ? `_is${Capitalize<string & J>}Loaded`
    : `is${Capitalize<string & K>}Loaded`]: Signal<boolean>;
} & {
  [K in keyof Calls as `${K & string}Error`]: Calls[K] extends CallConfig<
    any,
    any,
    any,
    infer Error
  >
    ? Signal<Error | undefined>
    : Signal<unknown | undefined>;
};

export type RxMethodRef = {
  destroy: () => void;
};

/**
 * The type of the parameter of a call, `never` when it takes none.
 */
export type ExtractCallParamType<T extends Call | CallConfig> = T extends (
  ...args: infer P
) => any
  ? P extends []
    ? never
    : P[0]
  : T extends CallConfig
    ? Parameters<T['call']> extends undefined[]
      ? never
      : Parameters<T['call']>[0]
    : never;

/**
 * The name of the resource method of a call: `<resultProp>Resource` when the
 * call renames its result, `<callName>Resource` otherwise, since the resource
 * is a view of the result. `never` when the call does not store its result
 * (`storeResult: false`), since there is no value for the resource to hold.
 *
 * A name starting with an underscore makes the resource private to the store,
 * the same rule every other generated member follows. So a private call with a
 * public `resultProp` gets a public resource, which is a way to expose only
 * the resource of a call to components.
 */
export type ExtractCallResourceName<
  K extends string | number | symbol,
  T extends Call | CallConfig,
> = T extends CallConfig
  ? T['storeResult'] extends false
    ? never
    : T['resultProp'] extends ''
      ? `${K & string}Resource`
      : `${T['resultProp'] & string}Resource`
  : `${K & string}Resource`;

/**
 * Options of the `<callName>Resource()` method generated by `withCalls`.
 */
export type CallResourceOptions<Param> = [Param] extends [never]
  ? {
      /**
       * Injector used to tie the view to a lifecycle, only needed when
       * created outside an injection context.
       */
      injector?: Injector;
    }
  : {
      /**
       * A signal, function or observable of the parameter of the call: the
       * call runs every time it emits, the same as calling the generated
       * method with it, except that `undefined` skips the call, so it can be
       * driven by an input that is not set yet. It is stopped when the
       * injection context it was created in is destroyed, or by `destroy()`.
       *
       * Requires an injection context (field initializer or constructor), or
       * the `injector` option.
       */
      params?: (() => Param | undefined) | Observable<Param | undefined>;
      /**
       * Injector used to subscribe to `params` and to tie the view to a
       * lifecycle, when created outside an injection context.
       */
      injector?: Injector;
    };

/**
 * The `<callName>Resource()` method generated by `withCalls`: returns a
 * resource view of the call, see `CallResource`.
 */
export type CallResourceMethod<T extends Call | CallConfig> = (
  options?: CallResourceOptions<ExtractCallParamType<T>>,
) => CallResource<ExtractCallResultType<T>, ExtractErrorType<T>>;

export type NamedCallResourceMethods<
  Calls extends Record<string, Call | CallConfig>,
> = {
  [K in keyof Calls as ExtractCallResourceName<
    K,
    Calls[K]
  >]: CallResourceMethod<Calls[K]>;
};
