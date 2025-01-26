import { Signal } from '@angular/core';

export type CallStatus = {
  loading: Signal<boolean>;
  error: Signal<unknown>;
};
