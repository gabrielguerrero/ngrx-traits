import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Sort } from '@ngrx-traits/common';

import { ProductDetailComponent } from '../../../../components/product-detail/product-detail.component';
import { ProductListComponent } from '../../../../components/product-list/product-list.component';
import { ProductSearchFormComponent } from '../../../../components/product-search-form/product-search-form.component';
import { Product, ProductFilter } from '../../../../models';
import { ProductsShopStore } from '../../products-shop.store';

@Component({
  selector: 'product-shop-tab',
  template: `
    <div class="m-8 grid sm:grid-cols-2" style="gap: 10px">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Product List</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <product-search-form
            [searchProduct]="store.productsFilter()"
            (searchProductChange)="filter($event)"
          />
          @if (store.productsCurrentPage().isLoading) {
            <mat-spinner />
          } @else {
            <product-list
              [list]="store.productsCurrentPage().entities"
              [selectedProduct]="store.productsEntitySelected()"
              (selectProduct)="select($event)"
              (sort)="sort($event)"
            />
            <mat-paginator
              [length]="store.productsCurrentPage().total"
              [pageSize]="store.productsCurrentPage().pageSize"
              [pageIndex]="store.productsCurrentPage().pageIndex"
              (page)="store.loadProductsPage($event)"
            />
          }
        </mat-card-content>
        <mat-card-actions [align]="'end'">
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="!store.productsEntitySelected()"
            (click)="store.addProductToBasket()"
          >
            <span>ADD TO BASKET</span>
          </button>
        </mat-card-actions>
      </mat-card>
      @if (store.isLoadProductDetailLoading()) {
        <mat-spinner />
      } @else if (store.isLoadProductDetailLoaded()) {
        <product-detail [product]="store.productDetail()" />
      } @else {
        <div class="content-center"><h2>Please Select a product</h2></div>
      }
    </div>
  `,
  styles: [
    `
      mat-card-content > mat-spinner {
        margin: 10px auto;
      }
      mat-card-actions mat-spinner {
        display: inline-block;
        margin-right: 5px;
      }
    `,
  ],
  standalone: true,
  imports: [
    MatCardModule,
    ProductSearchFormComponent,
    MatProgressSpinnerModule,
    MatButtonModule,
    ProductListComponent,
    ProductDetailComponent,
    AsyncPipe,
    MatPaginator,
  ],
})
export class ProductShopTabComponent {
  store = inject(ProductsShopStore);

  select({ id }: Product) {
    this.store.selectProductsEntity({ id });
    this.store.loadProductDetail({ id });
  }

  filter(filter: ProductFilter | undefined) {
    filter && this.store.filterProductsEntities({ filter });
  }

  sort(sort: Sort<Product>) {
    this.store.sortProductsEntities({
      sort: { field: sort.active as string, direction: sort.direction },
    });
  }
}
