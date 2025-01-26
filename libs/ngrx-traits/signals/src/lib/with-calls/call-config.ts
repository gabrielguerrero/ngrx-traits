import { CallConfig } from './with-calls.model';

/**
 * Call configuration object for withCalls
 * @param config - the call configuration
 * @param config.call - required, the function that will be called
 * @param config.mapPipe - optional, default exhaustMap the pipe operator that will be used to map the call result
 * @param config.storeResult - optional, default true, if false, the result will not be stored in the store
 * @param config.resultProp - optional, default callName + 'Result', the name of the prop where the result will be stored
 * @param config.onSuccess - optional, a function that will be called when the call is successful
 * @param config.mapError - optional, a function that will be called to transform the error before storing it
 * @param config.onError - optional, a function that will be called when the call fails
 * @param config.skipWhen - optional, a function that will be called to determine if the call should be skipped
 * @param config.callWith - optional, reactively execute the call with the provided params return by a function or signal or observable
 * @param config.defaultResult - optional, A default value for the result before the call is executed
 */
export function callConfig<
  Param = undefined,
  Result = any,
  PropName extends string = '',
  Error = unknown,
  C extends CallConfig<Param, Result, PropName, Error, Result> = CallConfig<
    Param,
    Result,
    PropName,
    Error,
    Result
  >,
  DefaultResult extends Result | undefined = undefined,
>(
  config: Omit<
    CallConfig<Param, Result, PropName, Error>,
    'resultProp' | 'storeResult' | 'defaultResult'
  > & {
    resultProp?: PropName;
    defaultResult: NoInfer<Result>;
  },
): C;
/**
 * Call configuration object for withCalls
 * @param config - the call configuration
 * @param config.call - required, the function that will be called
 * @param config.mapPipe - optional, default exhaustMap the pipe operator that will be used to map the call result
 * @param config.storeResult - optional, default true, if false, the result will not be stored in the store
 * @param config.resultProp - optional, default callName + 'Result', the name of the prop where the result will be stored
 * @param config.onSuccess - optional, a function that will be called when the call is successful
 * @param config.mapError - optional, a function that will be called to transform the error before storing it
 * @param config.onError - optional, a function that will be called when the call fails
 * @param config.skipWhen - optional, a function that will be called to determine if the call should be skipped
 * @param config.callWith - optional, reactively execute the call with the provided params return by a function or signal or observable
 * @param config.defaultResult - optional, A default value for the result before the call is executed
 */
export function callConfig<
  Param = undefined,
  Result = any,
  PropName extends string = '',
  Error = unknown,
  C extends CallConfig<Param, Result, PropName, Error, undefined> = CallConfig<
    Param,
    Result,
    PropName,
    Error,
    undefined
  >,
  DefaultResult extends Result | undefined = undefined,
>(
  config: Omit<
    CallConfig<Param, Result, PropName, Error>,
    'resultProp' | 'storeResult' | 'defaultResult'
  > & {
    resultProp?: PropName;
  },
): C;
/**
 * Call configuration object for withCalls
 * @param config - the call configuration
 * @param config.call - required, the function that will be called
 * @param config.mapPipe - optional, default exhaustMap the pipe operator that will be used to map the call result
 * @param config.storeResult - optional, default true, if false, the result will not be stored in the store
 * @param config.resultProp - optional, default callName + 'Result', the name of the prop where the result will be stored
 * @param config.onSuccess - optional, a function that will be called when the call is successful
 * @param config.mapError - optional, a function that will be called to transform the error before storing it
 * @param config.onError - optional, a function that will be called when the call fails
 * @param config.skipWhen - optional, a function that will be called to determine if the call should be skipped
 * @param config.callWith - optional, reactively execute the call with the provided params return by a function or signal or observable
 * @param config.defaultResult - optional, A default value for the result before the call is executed
 */
export function callConfig<
  Param = undefined,
  Result = any,
  Error = unknown,
  C extends Omit<
    CallConfig<Param, Result, '', Error>,
    'resultProp' | 'storeResult' | 'defaultResult'
  > & { storeResult: false } = Omit<
    CallConfig<Param, Result, '', Error>,
    'resultProp' | 'storeResult' | 'defaultResult'
  > & { storeResult: false },
>(
  config: Omit<
    CallConfig<Param, Result, '', Error>,
    'resultProp' | 'storeResult' | 'defaultResult'
  > & { storeResult: false },
): C & { resultProp: ''; defaultResult: undefined };
export function callConfig(config: any): any {
  return { ...config, resultProp: config.resultProp ?? '' };
}

// ===== Old version

/**
 * Call configuration object for withCalls
 * @Deprecated renamed to callConfig()
 * @param config - the call configuration
 * @param config.call - required, the function that will be called
 * @param config.mapPipe - optional, default exhaustMap the pipe operator that will be used to map the call result
 * @param config.storeResult - optional, default true, if false, the result will not be stored in the store
 * @param config.resultProp - optional, default callName + 'Result', the name of the prop where the result will be stored
 * @param config.onSuccess - optional, a function that will be called when the call is successful
 * @param config.mapError - optional, a function that will be called to transform the error before storing it
 * @param config.onError - optional, a function that will be called when the call fails
 * @param config.skipWhen - optional, a function that will be called to determine if the call should be skipped
 * @param config.callWith - optional, reactively execute the call with the provided params return by a function or signal or observable
 * @param config.defaultResult - optional, A default value for the result before the call is executed
 */
export function typedCallConfig<
  Param = undefined,
  Result = any,
  PropName extends string = '',
  Error = unknown,
  C extends CallConfig<Param, Result, PropName, Error, Result> = CallConfig<
    Param,
    Result,
    PropName,
    Error,
    Result
  >,
  DefaultResult extends Result | undefined = undefined,
>(
  config: Omit<
    CallConfig<Param, Result, PropName, Error>,
    'resultProp' | 'storeResult' | 'defaultResult'
  > & {
    resultProp?: PropName;
    defaultResult: NoInfer<Result>;
  },
): C;
/**
 * Call configuration object for withCalls
 * @Deprecated renamed to callConfig()
 * @param config - the call configuration
 * @param config.call - required, the function that will be called
 * @param config.mapPipe - optional, default exhaustMap the pipe operator that will be used to map the call result
 * @param config.storeResult - optional, default true, if false, the result will not be stored in the store
 * @param config.resultProp - optional, default callName + 'Result', the name of the prop where the result will be stored
 * @param config.onSuccess - optional, a function that will be called when the call is successful
 * @param config.mapError - optional, a function that will be called to transform the error before storing it
 * @param config.onError - optional, a function that will be called when the call fails
 * @param config.skipWhen - optional, a function that will be called to determine if the call should be skipped
 * @param config.callWith - optional, reactively execute the call with the provided params return by a function or signal or observable
 * @param config.defaultResult - optional, A default value for the result before the call is executed
 */
export function typedCallConfig<
  Param = undefined,
  Result = any,
  PropName extends string = '',
  Error = unknown,
  C extends CallConfig<Param, Result, PropName, Error, undefined> = CallConfig<
    Param,
    Result,
    PropName,
    Error,
    undefined
  >,
  DefaultResult extends Result | undefined = undefined,
>(
  config: Omit<
    CallConfig<Param, Result, PropName, Error>,
    'resultProp' | 'storeResult' | 'defaultResult'
  > & {
    resultProp?: PropName;
  },
): C;
/**
 * Call configuration object for withCalls
 * @Deprecated renamed to callConfig()
 * @param config - the call configuration
 * @param config.call - required, the function that will be called
 * @param config.mapPipe - optional, default exhaustMap the pipe operator that will be used to map the call result
 * @param config.storeResult - optional, default true, if false, the result will not be stored in the store
 * @param config.resultProp - optional, default callName + 'Result', the name of the prop where the result will be stored
 * @param config.onSuccess - optional, a function that will be called when the call is successful
 * @param config.mapError - optional, a function that will be called to transform the error before storing it
 * @param config.onError - optional, a function that will be called when the call fails
 * @param config.skipWhen - optional, a function that will be called to determine if the call should be skipped
 * @param config.callWith - optional, reactively execute the call with the provided params return by a function or signal or observable
 * @param config.defaultResult - optional, A default value for the result before the call is executed
 */
export function typedCallConfig<
  Param = undefined,
  Result = any,
  Error = unknown,
  C extends Omit<
    CallConfig<Param, Result, '', Error>,
    'resultProp' | 'storeResult' | 'defaultResult'
  > & { storeResult: false } = Omit<
    CallConfig<Param, Result, '', Error>,
    'resultProp' | 'storeResult' | 'defaultResult'
  > & { storeResult: false },
>(
  config: Omit<
    CallConfig<Param, Result, '', Error>,
    'resultProp' | 'storeResult' | 'defaultResult'
  > & { storeResult: false },
): C & { resultProp: ''; defaultResult: undefined };
export function typedCallConfig(config: any): any {
  return { ...config, resultProp: config.resultProp ?? '' };
}
