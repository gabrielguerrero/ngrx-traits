import { NgModule } from '@angular/core';
import { ProductPickerPageContainerComponent } from './product-picker-page-container.component';
import { CommonModule } from '@angular/common';
import { ProductPickerPageRoutingModule } from './product-picker-page-routing.module';
import { MatCardModule as MatCardModule } from '@angular/material/card';

@NgModule({
  imports: [
    CommonModule,
    ProductPickerPageRoutingModule,
    MatCardModule,
    ProductPickerPageContainerComponent,
  ],
})
export class ProductPickerPageModule {}
