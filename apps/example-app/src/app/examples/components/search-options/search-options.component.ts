import {
  Component,
  effect,
  ElementRef,
  inject,
  Input,
  input,
  Output,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'search-options',

  template: `
    <div
      (mousedown)="$event.stopPropagation()"
      class="mv-search-options flex items-center"
    >
      <input
        type="text"
        class="flex-1 "
        [placeholder]="placeholder()"
        matInput
        [formControl]="control"
        autocomplete="off"
        (keydown)="handleKeydown($event)"
        (keyup.enter)="selectFirst()"
        (click)="$event.stopPropagation()"
        #input
      />
      <button mat-icon-button matSuffix class="flex-initial" (click)="clear()">
        <mat-icon class="!flex items-center">close</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .mv-search-options {
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
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
  ],
})
export class SearchOptionsComponent {
  placeholder = input('Search...');

  control = new UntypedFormControl();

  @Output() valueChanges = this.control.valueChanges as Observable<string>;

  matSelect = inject(MatSelect);
  input = viewChild.required<ElementRef>('input');

  matOpenedChange = toSignal(this.matSelect.openedChange.pipe(delay(1)));
  onMatOpenedChange = effect(() => {
    if (this.matOpenedChange()) {
      this.focus();
    } else {
      this.control.reset(null, { emitEvent: false });
    }
  });

  get value() {
    return this.control.value;
  }
  @Input()
  set value(v: string) {
    this.control.setValue(v);
  }

  focus() {
    // save and restore scrollTop of panel, since it will be reset by focus()
    // note: this is hacky
    const panel = this.matSelect.panel.nativeElement;
    const scrollTop = panel.scrollTop;

    // focus
    this.input().nativeElement.focus();

    panel.scrollTop = scrollTop;
  }

  clear() {
    this.control.reset();
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
