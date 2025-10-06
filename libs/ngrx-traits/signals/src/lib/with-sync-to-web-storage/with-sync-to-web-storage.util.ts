export type StorageValueMapper<
  T,
  Store extends Record<string, any> = Record<string, any>,
> = (store: Store) => {
  storageValueToState: (value: T) => void;
  stateToStorageValue: () => T | undefined | null;
};
