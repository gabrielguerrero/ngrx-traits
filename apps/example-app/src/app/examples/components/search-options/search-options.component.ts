import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Observable, Subject } from 'rxjs';
import { takeUntil, delay } from 'rxjs/operators';

@Component({
  selector: 'search-options',
  template: `
    <div
      class="mat-form-field"
      gdColumns="1fr auto"
      gdAlignColumns="center center"
      matAutocompleteOrigin
      (mousedown)="$event.stopPropagation()"
      class="mv-search-options"
    >
      <input
        type="text"
        [placeholder]="placeholder"
        matInput
        [formControl]="control"
        autocomplete="off"
        (keydown)="handleKeydown($event)"
        (keyup.enter)="selectFirst()"
        (click)="$event.stopPropagation()"
        #input
      />
      <button
        mat-button
        mat-icon-button
        matSuffix
        (click)="clear()"
        [fxShow]="!!input.value"
      >
        <mat-icon>close</mat-icon>
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
        background-color: white;
        z-index: 1;
      }
    `,
  ],
})
export class SearchOptionsComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search...';

  control = new FormControl();
  destroy = new Subject();

  @Output() valueChanges = this.control.valueChanges as Observable<string>;

  @ViewChild('input', { static: true }) input: ElementRef | undefined;

  get value() {
    return this.control.value;
  }
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
