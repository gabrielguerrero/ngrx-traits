import { Signal } from '@angular/core';
import { Params } from '@angular/router';

export type QueryMapper<
  T extends Params = Params,
  Store extends Record<string, any> = Record<string, any>,
> = {
  queryParamsToState: (query: T, store: Store) => void;
  stateToQueryParams: (store: Store) => Signal<T> | undefined | null;
};
