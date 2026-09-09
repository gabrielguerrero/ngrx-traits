import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  debounce,
  email,
  form,
  FormField,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

import { initialRegistration, RegisterUserStore } from './register-user.store';
import { provideTemporalStringDateAdapter } from './temporal-string-date-adapter';

@Component({
  selector: 'register-user',
  template: `
    <a mat-raised-button routerLink="/signals" class="mb-4">Back to Examples</a>
    <mat-card>
      <mat-card-header>
        <mat-card-title>Register User</mat-card-title>
        <mat-card-subtitle>
          Example using withLink + withCalls + Angular Signal Forms
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <form>
          <mat-form-field>
            <mat-label>Name</mat-label>
            <input matInput [formField]="registerForm.name" />
            @if (
              registerForm.name().touched() && registerForm.name().invalid()
            ) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field>
            <mat-label>Email</mat-label>
            <input matInput type="email" [formField]="registerForm.email" />
            @if (store.isCheckEmailLoading()) {
              <mat-hint>Checking email...</mat-hint>
            } @else {
              <mat-hint>Try taken&#64;test.com</mat-hint>
            }
            @if (
              registerForm.email().touched() && registerForm.email().invalid()
            ) {
              <mat-error>{{
                registerForm.email().errors()[0].message ??
                  'Valid email is required'
              }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field>
            <mat-label>Password</mat-label>
            <input
              matInput
              type="password"
              [formField]="registerForm.password"
            />
            @if (store.passwordStrength(); as strength) {
              <mat-hint>Strength: {{ strength }}</mat-hint>
            }
            @if (
              registerForm.password().touched() &&
              registerForm.password().invalid()
            ) {
              <mat-error>Password must be at least 6 characters</mat-error>
            }
          </mat-form-field>

          <mat-form-field>
            <mat-label>Confirm Password</mat-label>
            <input
              matInput
              type="password"
              [formField]="registerForm.confirmPassword"
            />
            @if (
              registerForm.confirmPassword().touched() &&
              registerForm.confirmPassword().invalid()
            ) {
              <mat-error>Passwords must match</mat-error>
            }
          </mat-form-field>
          <mat-form-field>
            <mat-label>Date of Birth</mat-label>
            <input
              matInput
              [formField]="registerForm.dateOfBirth"
              [matDatepicker]="picker"
            />
            <mat-hint>DD/MM/YYYY</mat-hint>
            <mat-datepicker-toggle
              matIconSuffix
              [for]="picker"
            ></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <button
            mat-raised-button
            type="button"
            color="primary"
            (click)="onSubmit()"
            [disabled]="
              !registerForm().dirty() ||
              registerForm().invalid() ||
              store.isCheckEmailLoading() ||
              store.isRegisterUserLoading()
            "
          >
            @if (store.isRegisterUserLoading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              Register
            }
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 400px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    FormField,
    MatDatepickerModule,
    RouterLink,
  ],
  providers: [RegisterUserStore, provideTemporalStringDateAdapter()],
})
export class RegisterUserComponent {
  protected store = inject(RegisterUserStore);
  private snackBar = inject(MatSnackBar);

  // the form writes straight into the store, so the store can derive from
  // it (passwordStrength) and react to it (checkEmail) while it is filled in
  protected registerForm = form(this.store.linkRegistration(), (path) => {
    required(path.name);
    required(path.email);
    email(path.email);
    // the email only reaches the store, and the check, once typing pauses
    debounce(path.email, 300);
    validate(path.email, ({ value }) => {
      const check = this.store.checkEmailResult();
      return check?.email === value() && !check.available
        ? { kind: 'emailTaken', message: 'Email already taken' }
        : undefined;
    });
    required(path.password);
    minLength(path.password, 6);
    required(path.confirmPassword);
    validate(path.confirmPassword, ({ value, valueOf }) => {
      const password = valueOf(path.password);
      return value() !== password
        ? { kind: 'passwordMismatch', message: 'Passwords must match' }
        : undefined;
    });
  });

  async onSubmit() {
    await submit(this.registerForm, async () => {
      // the store already holds the form value
      const { name, email, password } = this.store.registration();

      const result = await this.store.registerUser({ name, email, password });

      if (result.ok) {
        this.snackBar.open('Registration successful!', 'Close', {
          duration: 3000,
        });
        this.registerForm().reset(initialRegistration);
      } else {
        this.snackBar.open(result.error() as string, 'Close', {
          duration: 5000,
        });
        return {
          kind: 'server',
          fieldTree: this.registerForm.email,
          message: result.error() as string,
        };
      }
      return undefined;
    });
  }
}
