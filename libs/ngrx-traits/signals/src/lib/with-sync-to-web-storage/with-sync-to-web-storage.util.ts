export type StorageValueMapper<
  T,
  Store extends Record<string, any> = Record<string, any>,
> = {
  storageValueToState: (query: T, store: Store) => void;
  stateToStorageValue: (store: Store) => T | undefined | null;
};
