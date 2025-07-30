import {
  Prettify,
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
