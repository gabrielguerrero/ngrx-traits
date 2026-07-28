import { Signal } from '@angular/core';
import { Params } from '@angular/router';

export type QueryMapper<
  T extends Params = Params,
  Store extends Record<string, any> = Record<string, any>,
> = {
  /**
   * @param firstLoad true only for the first query params emission restored
   *   into this store instance. Mappers should only read it, the caller resets
   *   it once all mappers have run.
   */
  queryParamsToState: (query: T, store: Store, firstLoad: boolean) => void;
  stateToQueryParams: (store: Store) => Signal<T> | undefined | null;
};
