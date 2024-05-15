import { Observable } from 'rxjs';

export type Call<Params extends readonly any[] = any[], Result = any> = (
  ...args: Params
) => Observable<Result> | Promise<Result>;
export type CallConfig<
  Params extends readonly any[] = any[],
  Result = any,
  PropName extends string = string,
> = {
  call: Call<Params, Result>;
  resultProp?: PropName;
  mapPipe?: 'switchMap' | 'concatMap' | 'exhaustMap';
  storeResult?: boolean;
  onSuccess?: (result: Result, ...params: Params) => void;
  onError?: (error: unknown, ...params: Params) => void;
};
export type ExtractCallResultType<T extends Call | CallConfig> =
  T extends Call<any, infer R>
    ? R
    : T extends CallConfig<any, infer R>
      ? R
      : never;
export type ExtractCallParams<T extends Call | CallConfig> =
  T extends Call<infer P> ? P : T extends CallConfig<infer P> ? P : never;
