import { Signal } from '@angular/core';

export type CallStatus = 'init' | 'loading' | 'loaded' | { error: unknown };
export type CallStatusState = {
  callStatus: CallStatus;
};
export type CallStatusComputed = {
  isLoading: Signal<boolean>;
} & {
  isLoaded: Signal<boolean>;
} & {
  error: Signal<string | null>;
};
export type CallStatusMethods = {
  setLoading: () => void;
} & {
  setLoaded: () => void;
} & {
  setError: (error?: unknown) => void;
};
export type NamedCallStatusState<Prop extends string> = {
  [K in Prop as `${K}CallStatus`]: CallStatus;
};
export type NamedCallStatusComputed<Prop extends string> = {
  [K in Prop as `is${Capitalize<string & K>}Loading`]: Signal<boolean>;
} & {
  [K in Prop as `is${Capitalize<string & K>}Loaded`]: Signal<boolean>;
} & {
  [K in Prop as `${K}Error`]: Signal<string | null>;
};
export type NamedCallStatusMethods<Prop extends string> = {
  [K in Prop as `set${Capitalize<string & K>}Loading`]: () => void;
} & {
  [K in Prop as `set${Capitalize<string & K>}Loaded`]: () => void;
} & {
  [K in Prop as `set${Capitalize<string & K>}Error`]: (error?: unknown) => void;
};
