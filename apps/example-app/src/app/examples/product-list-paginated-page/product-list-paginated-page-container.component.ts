import { Component, OnInit } from '@angular/core';
import { ProductActions, ProductSelectors } from './state/products';
import { combineLatest } from 'rxjs';
import { Product, ProductFilter } from '../models';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Sort } from 'ngrx-traits/traits';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'ngrx-traits-product-list-example-container',
  template: `
    <mat-card *ngIf="data$ | async as data">
      <mat-card-header>
        <mat-card-title>Product List</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-spinner *ngIf="data.isLoading; else listProducts"></mat-spinner>
        <ng-template #listProducts>
          <product-search-form
            (searchProduct)="filter($event)"
          ></product-search-form>
          <product-list
            [list]="data.products.entities"
            [selectedId]="data.selectedProduct?.id"
            [selectedSort]="data.selectedSort!"
            (selectProduct)="select($event)"
            (sort)="sort($event)"
          ></product-list>
          <mat-paginator
            [length]="data.products.total"
            [pageSize]="data.products.pageSize"
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
  data$ = combineLatest([
    this.store.select(ProductSelectors.selectPage),
    this.store.select(ProductSelectors.isLoading),
    this.store.select(ProductSelectors.selectEntitySelected),
    this.store.select(ProductSelectors.isLoadingCheckout),
    this.store.select(ProductSelectors.selectSort),
  ]).pipe(
    map(
      ([
        products,
        isLoading,
        selectedProduct,
        isLoadingCheckout,
        selectedSort,
      ]) => ({
        products,
        isLoading,
        selectedProduct,
        isLoadingCheckout,
        selectedSort,
      })
    )
  );

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(ProductActions.fetch());
  }

  select(id: string) {
    this.store.dispatch(ProductActions.select({ id }));
  }

  checkout() {
    this.store.dispatch(ProductActions.checkout());
  }

  filter(filters: ProductFilter) {
    this.store.dispatch(ProductActions.filter({ filters }));
  }
  // new event handler ↓
  sort(sort: Sort<Product>) {
    this.store.dispatch(ProductActions.sort(sort));
  }

  loadPage($event: PageEvent) {
    this.store.dispatch(ProductActions.loadPage({ index: $event.pageIndex }));
  }
}
