import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductSearchFormComponent } from './product-search-form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';



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
