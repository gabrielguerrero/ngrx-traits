import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withState } from '@ngrx/signals';

import {
  callConfig,
  withCalls,
  withLink,
  withLogger,
} from '@ngrx-traits/signals';

import { UserService } from '../../services/user.service';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
}

export const initialRegistration: RegisterData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: '2000-01-01',
};

const emailPattern = /^\S+@\S+\.\S+$/;

function scorePassword(password: string) {
  if (!password) return undefined;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  return score <= 1 ? 'weak' : score <= 3 ? 'medium' : 'strong';
}

export const RegisterUserStore = signalStore(
  withState({ registration: initialRegistration }),
  // generates linkRegistration(), the form writes straight into the store
  withLink('registration'),
  withComputed(({ registration }) => ({
    // derived as the user types
    passwordStrength: computed(() => scorePassword(registration().password)),
  })),
  withCalls(({ registration }) => ({
    // runs whenever the email changes, cancelling a check still in flight
    checkEmail: callConfig({
      call: (email: string) => inject(UserService).checkEmail(email),
      callWith: () => {
        const { email } = registration();
        return emailPattern.test(email) ? email : undefined;
      },
      mapPipe: 'switchMap',
    }),
    registerUser: callConfig({
      call: (params: { name: string; email: string; password: string }) =>
        inject(UserService).register(params),
      mapError: (error) => {
        return (error as HttpErrorResponse).error.message;
      },
    }),
  })),
  withLogger('RegisterUserStore'),
);
