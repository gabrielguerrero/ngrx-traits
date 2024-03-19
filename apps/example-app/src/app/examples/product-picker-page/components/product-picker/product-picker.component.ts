import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  EventEmitter,
} from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../../models';
import { MatDialog as MatDialog } from '@angular/material/dialog';
import { ProductSelectDialogComponent } from '../product-select-dialog/product-select-dialog.component';
import { first } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

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
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class ProductPickerComponent {
  /**
   * NOTE: I will normally implement ControlValueAccessor for this kind of component,
   * to make more useful, but is omitted keep the example simple.
   */
  control = new UntypedFormControl();
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
