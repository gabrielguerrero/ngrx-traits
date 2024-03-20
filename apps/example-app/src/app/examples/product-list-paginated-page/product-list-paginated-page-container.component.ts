import { Component, OnInit } from '@angular/core';
import { ProductActions, ProductSelectors } from './state/products';
import { Product, ProductFilter } from '../models';
import { createSelector, Store } from '@ngrx/store';
import { Sort } from '@ngrx-traits/common';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { ProductListComponent } from '../components/product-list/product-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductSearchFormComponent } from '../components/product-search-form/product-search-form.component';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe } from '@angular/common';
import { ProductsStateModule } from './state/products/products-state.module';

@Component({
  selector: 'ngrx-traits-product-list-example-container',
  template: `
    @if (data$ | async; as data) {
    <mat-card>
      <mat-card-header>
        <mat-card-title>Product List</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <product-search-form
          [searchProduct]="data.filters"
          (searchProductChange)="filter($event)"
        ></product-search-form>
        @if (data.isLoading) {
        <mat-spinner></mat-spinner>
        } @else {
        <product-list
          [list]="data.products.entities"
          [selectedProduct]="data.selectedProduct"
          [selectedSort]="data.selectedSort"
          (selectProduct)="select($event)"
          (sort)="sort($event)"
        ></product-list>
        <mat-paginator
          [length]="data.products.total"
          [pageSize]="data.products.pageSize"
          [pageIndex]="data.products.pageIndex"
          (page)="loadPage($event)"
        ></mat-paginator>
        }
      </mat-card-content>
      <mat-card-actions [align]="'end'">
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="!data.selectedProduct || data.isLoadingCheckout"
          (click)="checkout()"
        >
          @if (data.isLoadingCheckout) {
          <mat-spinner [diameter]="20"></mat-spinner>
          }
          <span>CHECKOUT</span>
        </button>
      </mat-card-actions>
    </mat-card>
    }
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
    ProductsStateModule,
    ProductSearchFormComponent,
    MatProgressSpinnerModule,
    ProductListComponent,
    MatPaginatorModule,
    MatButtonModule,
    AsyncPipe,
  ],
})
export class ProductListPaginatedPageContainerComponent implements OnInit {
  componentData = createSelector({
    products: ProductSelectors.selectProductsCurrentPage,
    isLoading: ProductSelectors.isLoadingProductsCurrentPage,
    selectedProduct: ProductSelectors.selectProductSelected,
    isLoadingCheckout: ProductSelectors.isLoadingCheckout,
    selectedSort: ProductSelectors.selectProductsSort,
    filters: ProductSelectors.selectProductsFilter,
  });

  data$ = this.store.select(this.componentData);

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(ProductActions.loadProductsUsingRouteQueryParams());
  }

  select({ id }: Product) {
    this.store.dispatch(ProductActions.selectProduct({ id }));
  }

  checkout() {
    this.store.dispatch(ProductActions.checkout());
  }

  filter(filters: ProductFilter | undefined) {
    filters && this.store.dispatch(ProductActions.filterProducts({ filters }));
  }

  sort(sort: Sort<Product>) {
    this.store.dispatch(ProductActions.sortProducts(sort));
  }

  loadPage($event: PageEvent) {
    this.store.dispatch(
      ProductActions.loadProductsPage({ index: $event.pageIndex })
    );
  }
}
