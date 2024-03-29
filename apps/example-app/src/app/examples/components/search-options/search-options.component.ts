import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelect as MatSelect } from '@angular/material/select';
import { Observable, Subject } from 'rxjs';
import { takeUntil, delay } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { input } from '@angular/core';

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
export class SearchOptionsComponent implements OnInit, OnDestroy {
  placeholder = input('Search...');

  control = new UntypedFormControl();
  destroy = new Subject<void>();

  @Output() valueChanges = this.control.valueChanges as Observable<string>;

  @ViewChild('input', { static: true }) input: ElementRef | undefined;

  get value() {
    return this.control.value;
  }
  @Input()
  set value(v: string) {
    this.control.setValue(v);
  }

  constructor(private matSelect: MatSelect) {}

  ngOnInit(): void {
    this.matSelect.openedChange
      .pipe(takeUntil(this.destroy), delay(1))
      .subscribe((opened) => {
        if (opened) {
          this.focus();
        } else {
          this.control.reset(null, { emitEvent: false });
        }
      });
  }

  focus() {
    // save and restore scrollTop of panel, since it will be reset by focus()
    // note: this is hacky
    const panel = this.matSelect.panel.nativeElement;
    const scrollTop = panel.scrollTop;

    // focus
    this.input?.nativeElement?.focus();

    panel.scrollTop = scrollTop;
  }

  ngOnDestroy(): void {
    this.destroy.next();
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
