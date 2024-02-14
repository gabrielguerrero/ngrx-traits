import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from './product-list.component';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatSortModule } from '@angular/material/sort';



@NgModule({
  declarations: [
    ProductListComponent
  ],
  exports: [ProductListComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule
  ]
})
export class ProductListModule { }
