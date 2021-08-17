import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductBasketComponent } from './product-basket.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
