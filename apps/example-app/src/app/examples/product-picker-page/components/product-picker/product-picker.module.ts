import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductPickerComponent } from './product-picker.component';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProductSelectDialogModule } from '../product-select-dialog/product-select-dialog.module';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [ProductPickerComponent],
  imports: [
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ProductSelectDialogModule,
  ],
  exports: [ProductPickerComponent],
})
export class ProductPickerModule {}
