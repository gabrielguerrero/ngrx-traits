import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

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
   * The function accepts the  call parameter and must return a boolean | Signal<boolean> | Observable<boolean>.
   */
  skipWhen?: (
    param: NoInfer<Param>,
    previousResult: NoInfer<Result> | undefined,
  ) => boolean | Promise<boolean> | Observable<boolean>;

  /**
   * Reactively execute the call with the provided params.
   * Supports the following:
   * - A direct parameter value. Which execute the call once on init.
   * - A `Signal` or `Observable` emitting the parameter of the call or undefined.
   * - A function returning the parameter or undefined.
   *
   * **Warning**: By default, when withCall is a function, signal
   * or observable that when returns a falsy value it will skip the call.
   * To override this behavior, define a skipWhen with your own rule or skipWhen: () => false
   * to always execute on any value.
   */
  callWith?: Param extends Record<string, any> | string | number | boolean
    ?
        | NoInfer<Param>
        | null
        | undefined
        | Signal<NoInfer<Param | null | undefined>>
        | Observable<NoInfer<Param | null | undefined>>
        | (() => NoInfer<Param> | null | undefined)
    : Signal<boolean> | Observable<boolean> | (() => boolean) | boolean;
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
