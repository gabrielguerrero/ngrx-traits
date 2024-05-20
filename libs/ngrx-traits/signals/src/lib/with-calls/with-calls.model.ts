import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

export type Call<Param extends any = any, Result = any> =
  | (() => Observable<Result> | Promise<Result>)
  | ((arg: Param) => Observable<Result> | Promise<Result>);
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
};
export type ExtractCallResultType<T extends Call | CallConfig> =
  T extends Call<any, infer R>
    ? R
    : T extends CallConfig<any, infer R>
      ? R
      : never;
export type ExtractCallParams<T extends Call | CallConfig> =
  T extends Call<infer P> ? P : T extends CallConfig<infer P> ? P : undefined;

export type NamedCallsStatusComputed<Prop extends string> = {
  [K in Prop as `is${Capitalize<string & K>}Loading`]: Signal<boolean>;
} & {
  [K in Prop as `is${Capitalize<string & K>}Loaded`]: Signal<boolean>;
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
