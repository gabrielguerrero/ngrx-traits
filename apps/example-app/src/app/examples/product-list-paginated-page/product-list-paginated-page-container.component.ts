import { Component, OnInit } from '@angular/core';
import { ProductActions, ProductSelectors } from './state/products';
import { Product, ProductFilter } from '../models';
import { createSelector, Store } from '@ngrx/store';
import { Sort } from '@ngrx-traits/common';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';

@Component({
  selector: 'ngrx-traits-product-list-example-container',
  template: `
    <mat-card *ngIf="data$ | async as data">
      <mat-card-header>
        <mat-card-title>Product List</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <product-search-form
          [value]="data.filters"
          (searchProduct)="filter($event)"
        ></product-search-form>
        <mat-spinner *ngIf="data.isLoading; else listProducts"></mat-spinner>
        <ng-template #listProducts>
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
        </ng-template>
      </mat-card-content>
      <mat-card-actions [align]="'end'">
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="!data.selectedProduct || data.isLoadingCheckout"
          (click)="checkout()"
        >
          <mat-spinner
            [diameter]="20"
            *ngIf="data.isLoadingCheckout"
          ></mat-spinner>
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
})
export class ProductListPaginatedPageContainerComponent implements OnInit {
  componentData = createSelector(
    ProductSelectors.selectProductsCurrentPage,
    ProductSelectors.isLoadingProductsCurrentPage,
    ProductSelectors.selectProductSelected,
    ProductSelectors.isLoadingCheckout,
    ProductSelectors.selectProductsSort,
    ProductSelectors.selectProductsFilter,
    (
      products,
      isLoading,
      selectedProduct,
      isLoadingCheckout,
      selectedSort,
      filters
    ) => ({
      products,
      isLoading,
      selectedProduct,
      isLoadingCheckout,
      selectedSort,
      filters,
    })
  );
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

  filter(filters: ProductFilter) {
    this.store.dispatch(ProductActions.filterProducts({ filters }));
  }
  // new event handler ↓
  sort(sort: Sort<Product>) {
    this.store.dispatch(ProductActions.sortProducts(sort));
  }

  loadPage($event: PageEvent) {
    this.store.dispatch(
      ProductActions.loadProductsPage({ index: $event.pageIndex })
    );
  }
}
