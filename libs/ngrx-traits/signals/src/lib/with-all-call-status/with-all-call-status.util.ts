import { Signal } from '@angular/core';

import { CallStatus } from './with-all-call-status.model';

export function registerCallState(
  store: Record<string, any>,
  callStatus: CallStatus,
) {
  if ('_registerCallStatus' in store) {
    (
      store as { _registerCallStatus: (callStatus: CallStatus) => void }
    )._registerCallStatus(callStatus);
  }
}
