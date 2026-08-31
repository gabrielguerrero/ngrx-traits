import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { Console, consoleOptionsArray } from '@example-api/shared/models';

@Component({
  selector: 'console-picker',
  template: `
    <mat-chip-listbox
      multiple
      [value]="value()"
      (change)="onChange($event)"
      aria-label="Consoles"
    >
      @for (console of consoles; track console.id) {
        <mat-chip-option [value]="console.id">{{
          console.label
        }}</mat-chip-option>
      }
    </mat-chip-listbox>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatChipsModule],
})
export class ConsolePickerComponent implements FormValueControl<Console[]> {
  value = model<Console[]>([]);
  protected consoles = consoleOptionsArray;

  protected onChange(event: MatChipListboxChange) {
    this.value.set((event.value as Console[]) ?? []);
  }
}
