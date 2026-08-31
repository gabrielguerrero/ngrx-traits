import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Console, consoleOptionsArray } from '@example-api/shared/models';

/**
 * Single console picker. A `FormValueControl`, so it binds to a signal form
 * field with `[formField]` like a native input.
 */
@Component({
  selector: 'console-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field class="w-full">
      <mat-label>Console</mat-label>
      <mat-select [(value)]="value" [disabled]="disabled()">
        @for (option of consoles; track option.id) {
          <mat-option [value]="option.id">{{ option.label }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class ConsoleSelect implements FormValueControl<Console> {
  value = model<Console>('snes');
  readonly = input<boolean>(false);
  disabled = input<boolean>(false);

  protected consoles = consoleOptionsArray;
}
