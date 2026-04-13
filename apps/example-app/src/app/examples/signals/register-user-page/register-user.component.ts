import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
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

import { RegisterUserStore } from './register-user.store';
import { provideTemporalStringDateAdapter } from './temporal-string-date-adapter';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
}

const initialValue: RegisterData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: '2000-01-01',
};

@Component({
  selector: 'register-user',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Register User</mat-card-title>
        <mat-card-subtitle>
          Example using withCalls + Angular Signal Forms
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
            @if (
              registerForm.email().touched() && registerForm.email().invalid()
            ) {
              <mat-error>Valid email is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field>
            <mat-label>Password</mat-label>
            <input
              matInput
              type="password"
              [formField]="registerForm.password"
            />
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
              registerForm().invalid() || store.isRegisterUserLoading()
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
  ],
  providers: [RegisterUserStore, provideTemporalStringDateAdapter()],
})
export class RegisterUserComponent {
  protected store = inject(RegisterUserStore);
  private snackBar = inject(MatSnackBar);

  protected model = signal<RegisterData>({ ...initialValue });
  protected registerForm = form(this.model, (path) => {
    required(path.name);
    required(path.email);
    email(path.email);
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
      const { name, email, password, dateOfBirth } = this.model();

      const result = await this.store.registerUser({ name, email, password });

      if (result.ok) {
        this.snackBar.open('Registration successful!', 'Close', {
          duration: 3000,
        });
        this.model.set({ ...initialValue });
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
