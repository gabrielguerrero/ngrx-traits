import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  EventEmitter,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Product } from '../../../models';
import { MatDialog } from '@angular/material/dialog';
import { ProductSelectDialogComponent } from '../product-select-dialog/product-select-dialog.component';
import { first } from 'rxjs/operators';

@Component({
  selector: 'product-picker',
  template: `<mat-form-field>
    <mat-label>Product</mat-label>
    <input
      #inputElement
      matInput
      (click)="open()"
      [formControl]="control"
      [placeholder]="'Select a Product'"
      [value]="selectedProduct?.name"
      [readonly]="true"
    />

    <button
      data-testid="clear-button"
      [disabled]="!selectedProduct?.id"
      mat-icon-button
      matSuffix
      (click)="clear()"
    >
      <mat-icon>clear</mat-icon>
    </button>

    <button
      data-testid="open-button"
      [disabled]="this.control.disabled"
      type="button"
      mat-icon-button
      matSuffix
      (click)="open()"
    >
      <mat-icon>expand_more</mat-icon>
    </button>
  </mat-form-field>`,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPickerComponent {
  /**
   * NOTE: I will normally implement ControlValueAccessor for this kind of component,
   * to make more useful, but is omitted keep the example simple.
   */
  control = new FormControl();
  selectedProduct: Product | undefined;
  selectProduct = new EventEmitter();

  @ViewChild('inputElement', { static: true })
  inputElement: ElementRef | undefined;

  constructor(private matDialog: MatDialog) {}

  clear() {
    this.control.patchValue('');
    this.selectedProduct = undefined;
    this.selectProduct.emit(null);
  }

  open() {
    this.matDialog
      .open(ProductSelectDialogComponent, {
        width: '70vw',
      })
      .afterClosed()
      .pipe(first())
      .subscribe((value) => {
        this.selectedProduct = value;
        this.control.patchValue(value?.name);
      });
  }
}
