import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetailComponent } from './product-detail.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [ProductDetailComponent],
  exports: [ProductDetailComponent],
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
})
export class ProductDetailModule {}
