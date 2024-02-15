import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductSearchFormComponent } from './product-search-form.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';



@NgModule({
  declarations: [
    ProductSearchFormComponent
  ],
  exports: [
    ProductSearchFormComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule
  ]
})
export class ProductSearchFormModule { }
