import {
  Prettify,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  StateSignals,
  WritableStateSource,
} from '@ngrx/signals';

export type FeatureConfigFactory<
  Input extends SignalStoreFeatureResult,
  Config extends Record<string, any>,
  FactoryConfig extends Record<string, any> = Config,
> = Config | ((store: StoreSource<Input>) => FactoryConfig);

export type StoreSource<Input extends SignalStoreFeatureResult> = Prettify<
  StateSignals<Input['state']> &
    Input['props'] &
    Input['methods'] &
    WritableStateSource<Input['state']>
>;
export function getFeatureConfig<
  Input extends SignalStoreFeatureResult,
  Config extends Record<string, any>,
>(config: FeatureConfigFactory<Input, Config>, store: StoreSource<Input>) {
  return typeof config === 'function' ? config(store) : config;
}

/**
 * Combines the two-arg form (entityConfig, options) of a feature into the
 * single config factory the implementations consume. With no options the first
 * arg (object or factory) is used as is.
 */
export function combineFeatureConfig(
  configOrFactory: FeatureConfigFactory<any, Record<string, any>>,
  options: FeatureConfigFactory<any, Record<string, any>> | undefined,
): FeatureConfigFactory<any, Record<string, any>> {
  if (options === undefined) return configOrFactory;
  return typeof options === 'function'
    ? (store: any) => ({
        ...getFeatureConfig(configOrFactory, store),
        ...options(store),
      })
    : typeof configOrFactory === 'function'
      ? (store: any) => ({ ...configOrFactory(store), ...options })
      : { ...configOrFactory, ...options };
}
export type ExtractStoreFeatureOutput<
  Result extends (...args: any[]) => SignalStoreFeature<any, any>,
> =
  ReturnType<Result> extends SignalStoreFeature<infer In, infer Out>
    ? In & Out
    : never;
