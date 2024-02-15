import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductPickerComponent } from './product-picker.component';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { ProductSelectDialogModule } from '../product-select-dialog/product-select-dialog.module';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

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
