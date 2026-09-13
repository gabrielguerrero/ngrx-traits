import { CallConfig, CallTypeError, IsAny } from './with-calls.model';

/**
 * Rejects a call whose parameter is `any` where the config is written: the
 * config is asked for a property nothing has, so the message lands on the
 * offending call rather than on every use of the generated method.
 */
type RejectAnyParam<Param> =
  IsAny<Param> extends true
    ? CallTypeError<'withCalls: a call parameter of type `any` is not supported, give the call an explicit parameter type'>
    : unknown;

type CallConfigOptions<Param, Result, Error> = Omit<
  CallConfig<Param, Result, string, Error>,
  'resultProp' | 'storeResult' | 'defaultResult'
>;

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
 * @param config.callWith - optional, reactively execute the call with the provided params return by a function or observable
 * @param config.defaultResult - optional, A default value for the result before the call is executed
 */
// NoInfer on the return types: withCalls gives the config a contextual type of
// CallConfig<any, any, string, any, any>, which would otherwise be inferred
// into the generics the argument does not mention, such as PropName
export function callConfig<Param = undefined, Result = any, Error = unknown>(
  config: CallConfigOptions<Param, Result, Error> & {
    storeResult: false;
  } & RejectAnyParam<Param>,
): NoInfer<
  CallConfig<Param, Result, '', Error, undefined> & { storeResult: false }
>;
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
 * @param config.callWith - optional, reactively execute the call with the provided params return by a function or observable
 * @param config.defaultResult - optional, A default value for the result before the call is executed
 */
export function callConfig<
  Param = undefined,
  Result = any,
  Error = unknown,
  PropName extends string = '',
  // only its nullability matters: a defined default makes the result prop
  // non nullable, see ExtractCallResultType
  DefaultResult extends Result | undefined = undefined,
>(
  config: CallConfigOptions<Param, Result, Error> & {
    resultProp?: PropName;
    storeResult?: true;
    defaultResult?: DefaultResult;
  } & RejectAnyParam<Param>,
): NoInfer<CallConfig<Param, Result, PropName, Error, DefaultResult>>;
export function callConfig(config: any): any {
  return { ...config, resultProp: config.resultProp ?? '' };
}
