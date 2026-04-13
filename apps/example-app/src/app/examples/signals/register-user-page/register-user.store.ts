import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { callConfig, withCalls, withLogger } from '@ngrx-traits/signals';
import { signalStore } from '@ngrx/signals';

import { UserService } from '../../services/user.service';

export const RegisterUserStore = signalStore(
  withCalls(() => ({
    registerUser: callConfig({
      call: (params: { name: string; email: string; password: string }) =>
        inject(UserService).register(params),
      mapError: (error) => {
        return (error as HttpErrorResponse).error.message;
      },
    }),
  })),
  withLogger({ name: 'RegisterUserStore' }),
);
