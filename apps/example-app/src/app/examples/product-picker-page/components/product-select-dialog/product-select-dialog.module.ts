import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductSelectDialogComponent } from './product-select-dialog.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { ProductListModule } from '../../../components/product-list/product-list.module';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ProductSearchFormModule } from '../../../components/product-search-form/product-search-form.module';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

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
