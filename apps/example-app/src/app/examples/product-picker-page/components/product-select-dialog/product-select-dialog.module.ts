import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductSelectDialogComponent } from './product-select-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ProductListModule } from '../../../components/product-list/product-list.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductSearchFormModule } from '../../../components/product-search-form/product-search-form.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ProductSelectDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    ProductListModule,
    MatProgressSpinnerModule,
    ProductSearchFormModule,
    MatButtonModule,
  ],
})
export class ProductSelectDialogModule {}
