import { NgModule } from '@angular/core';
import { ProductPickerPageContainerComponent } from './product-picker-page-container.component';
import { CommonModule } from '@angular/common';
import { ProductPickerPageRoutingModule } from './product-picker-page-routing.module';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { ProductPickerModule } from './components/product-picker/product-picker.module';

@NgModule({
  declarations: [ProductPickerPageContainerComponent],
  imports: [
    CommonModule,
    ProductPickerPageRoutingModule,
    MatCardModule,
    ProductPickerModule,
  ],
})
export class ProductPickerPageModule {}
