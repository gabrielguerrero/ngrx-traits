import { Component, effect, inject, input, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'search-options',

  template: `
    <div
      (mousedown)="$event.stopPropagation()"
      class="search-options flex items-center"
    >
      <input
        type="text"
        class="flex-1 "
        [placeholder]="placeholder()"
        matInput
        [formField]="field"
        autocomplete="off"
        (keydown)="handleKeydown($event)"
        (keyup.enter)="selectFirst()"
        (click)="$event.stopPropagation()"
        #input
      />
      <button
        type="button"
        mat-icon-button
        matSuffix
        class="flex-initial"
        (click)="clear()"
      >
        <mat-icon class="!flex items-center">close</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .search-options {
        border: 1px solid rgba(0, 0, 0, 0.04);
        height: 3em;
        line-height: 3em;
        padding: 0 16px;
      }
      :host {
        position: sticky;
        top: 0;
        display: block;
        z-index: 1;
      }
    `,
  ],
  standalone: true,
  imports: [
    MatInputModule,
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
  ],
})
export class SearchOptionsComponent {
  placeholder = input('Search...');

  value = model<string>('');
  field = form(this.value);

  matSelect = inject(MatSelect);

  matOpenedChange = toSignal(this.matSelect.openedChange.pipe(delay(1)));
  onMatOpenedChange = effect(() => {
    if (this.matOpenedChange()) {
      this.focus();
    } else {
      this.value.set('');
    }
  });

  focus() {
    // save and restore scrollTop of panel, since it will be reset by focus()
    // note: this is hacky
    const panel = this.matSelect.panel.nativeElement;
    const scrollTop = panel.scrollTop;

    // focus
    this.field().focusBoundControl();

    panel.scrollTop = scrollTop;
  }

  clear() {
    this.value.set('');
  }

  handleKeydown(event: KeyboardEvent) {
    // Prevent propagation for all alphanumeric characters in order to avoid selection issues
    if (
      (event.key && event.key.length === 1) ||
      event.key === ' ' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      event.stopPropagation();
    }
  }

  selectFirst() {
    this.matSelect.options.first?.select();
    this.matSelect.close();
  }
}
