export type TransferValueMapper<
  T,
  Store extends Record<string, any> = Record<string, any>,
> = (store: Store) => {
  transferValueToState: (value: T) => void;
  stateToTransferValue: () => T | undefined | null;
};
