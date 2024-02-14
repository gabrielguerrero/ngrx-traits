import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductBasketComponent } from './product-basket.component';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ProductBasketComponent],
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  exports: [ProductBasketComponent],
})
export class ProductBasketModule {}
