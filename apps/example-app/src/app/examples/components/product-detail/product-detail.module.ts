import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetailComponent } from './product-detail.component';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

@NgModule({
  declarations: [ProductDetailComponent],
  exports: [ProductDetailComponent],
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
})
export class ProductDetailModule {}
