import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

export type Call<Params extends readonly any[] = any[], Result = any> = (
  ...args: Params
) => Observable<Result> | Promise<Result>;
export type CallConfig<
  Params extends readonly any[] = any[],
  Result = any,
  PropName extends string = string,
  Error = any,
> = {
  call: Call<Params, Result>;
  resultProp: PropName;
  mapPipe?: 'switchMap' | 'concatMap' | 'exhaustMap';
  storeResult?: boolean;
  onSuccess?: (result: Result, param: Params[0]) => void;
  mapError?: (error: unknown, param: Params[0]) => Error;
  onError?: (error: Error, param: Params[0]) => void;
};
export type ExtractCallResultType<T extends Call | CallConfig> =
  T extends Call<any, infer R>
    ? R
    : T extends CallConfig<any, infer R>
      ? R
      : never;
export type ExtractCallParams<T extends Call | CallConfig> =
  T extends Call<infer P> ? P : T extends CallConfig<infer P> ? P : [];

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
