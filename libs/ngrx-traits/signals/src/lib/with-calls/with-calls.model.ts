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
> = {
  call: Call<Param, Result>;
  resultProp: PropName;
  mapPipe?: 'switchMap' | 'concatMap' | 'exhaustMap';
  storeResult?: boolean;
  onSuccess?: (result: Result, param: Param) => void;
  mapError?: (error: unknown, param: Param) => Error;
  onError?: (error: Error, param: Param) => void;
  skipWhen?:
    | Call<Param, boolean>
    | (() => boolean)
    | ((param: Param) => boolean);
};

export type ExtractCallResultType<T extends Call | CallConfig> =
  T extends Call<any, infer R>
    ? R
    : T extends CallConfig<any, infer R>
      ? R
      : never;

export type NamedCallsStatusComputed<Prop extends string> = {
  [K in Prop as K extends `_${infer J}`
    ? `_is${Capitalize<string & J>}Loading`
    : `is${Capitalize<string & K>}Loading`]: Signal<boolean>;
} & {
  [K in Prop as K extends `_${infer J}`
    ? `_is${Capitalize<string & J>}Loaded`
    : `is${Capitalize<string & K>}Loaded`]: Signal<boolean>;
};
export type NamedCallsStatusErrorComputed<
  Calls extends Record<string, Call | CallConfig>,
> = {
  [K in keyof Calls as `${K & string}Error`]: Calls[K] extends CallConfig<
    any,
    any,
    any,
    infer Error
  >
    ? Signal<Error | undefined>
    : Signal<unknown | undefined>;
};
