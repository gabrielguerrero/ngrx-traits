import { Signal } from '@angular/core';

import { CallStatus } from '../with-call-status/with-call-status.model';

export type NamedCallStatusMapState<Prop extends string> = {
  [K in Prop as `${K}CallStatus`]: Record<string | number, CallStatus>;
};

export type NamedCallStatusMapComputed<Prop extends string, Error = unknown> = {
  [K in Prop as `isAny${Capitalize<string & K>}Loading`]: Signal<boolean>;
} & {
  [K in Prop as `areAll${Capitalize<string & K>}Loaded`]: Signal<boolean>;
} & {
  [K in Prop as `${K}Errors`]: Signal<Error[] | undefined>;
};

export type NamedCallStatusMapMethods<Prop extends string, Error = any> = {
  [K in Prop as `is${Capitalize<string & K>}Loading`]: (id: string) => boolean;
} & {
  [K in Prop as `is${Capitalize<string & K>}Loaded`]: (id: string) => boolean;
} & {
  [K in Prop as `${K}Error`]: (id: string) => Error | undefined;
} & {
  [K in Prop as `set${Capitalize<string & K>}Loading`]: (id: string) => void;
} & {
  [K in Prop as `set${Capitalize<string & K>}Loaded`]: (id: string) => void;
} & {
  [K in Prop as `set${Capitalize<string & K>}Error`]: (
    id: string,
    error: Error,
  ) => void;
};
