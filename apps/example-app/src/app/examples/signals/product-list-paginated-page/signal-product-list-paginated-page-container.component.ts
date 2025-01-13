import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { Sort } from '@ngrx-traits/common';

import { ProductDetailComponent } from '../../components/product-detail/product-detail.component';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { ProductSearchFormComponent } from '../../components/product-search-form/product-search-form.component';
import { Product, ProductFilter } from '../../models';
import { ProductsLocalStore } from './product.store';

@Component({
  selector: 'ngrx-traits-product-list-example-container',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Product List</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <product-search-form
          [searchProduct]="store.productsFilter()"
          (searchProductChange)="filter($event)"
        ></product-search-form>
        @if (store.isProductsLoading()) {
          <mat-spinner></mat-spinner>
        } @else {
          <div class="sm:m-4 grid sm:grid-cols-2 gap-8">
            <div>
              <product-list
                [list]="store.productsCurrentPage().entities"
                [selectedProduct]="store.productsEntitySelected()"
                [selectedSort]="{
                  active: $any(store.productsSort().field),
                  direction: store.productsSort().direction
                }"
                (selectProduct)="select($event)"
                (sort)="sort($event)"
              ></product-list>

              <!-- [selectedSort]="store.productsSort()" -->
              <mat-paginator
                [pageSizeOptions]="[5, 10, 25, 100]"
                [length]="store.productsCurrentPage().total"
                [pageSize]="store.productsCurrentPage().pageSize"
                [pageIndex]="store.productsCurrentPage().pageIndex"
                (page)="store.loadProductsPage($event)"
              ></mat-paginator>
            </div>

            @if (store.isLoadProductDetailLoading()) {
              <mat-spinner />
            } @else if (store.isLoadProductDetailLoaded()) {
              <a routerLink="{{ store.productDetail()?.id }}">
                <product-detail [product]="store.productDetail()!" />
              </a>
            } @else {
              <div class="content-center"><h2>Please Select a product</h2></div>
            }
          </div>
        }
      </mat-card-content>
      <mat-card-actions [align]="'end'">
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="
            !store.productsEntitySelected() || store.isCheckoutLoading()
          "
          (click)="checkout()"
        >
          @if (store.isCheckoutLoading()) {
            <mat-spinner [diameter]="20"></mat-spinner>
          }
          <span>CHECKOUT</span>
        </button>
      </mat-card-actions>
    </mat-card>
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
    ProductListComponent,
    MatPaginatorModule,
    MatButtonModule,
    ProductDetailComponent,
    RouterLink,
  ],
  providers: [ProductsLocalStore],
})
export class SignalProductListPaginatedPageContainerComponent {
  store = inject(ProductsLocalStore);

  select({ id }: Product) {
    this.store.selectProductsEntity({ id });
    this.store.loadProductDetail({ id });
  }

  checkout() {
    this.store.checkout();
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
