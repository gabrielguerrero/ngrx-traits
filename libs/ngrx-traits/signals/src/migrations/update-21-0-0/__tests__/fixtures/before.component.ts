import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { createProductsStore } from '../products.store';

@Component({
  selector: 'app-products',
  standalone: true,
  template: `
    <div>
      <p>Loading: {{ isProductsLoading() }}</p>
      <p>Error: {{ productsError() }}</p>
      <p>Current Page: {{ productsCurrentPage() }}</p>
      <p>Filter: {{ productsFilter() }}</p>
      <p>Sort: {{ productsSort() }}</p>
      <button (click)="loadProductsPage(1)">Load Page</button>
      <button (click)="resetProductsFilter()">Reset Filter</button>
      <button (click)="sortProducts()">Sort</button>
    </div>
  `
})
export class ProductsComponent {
  store = inject(createProductsStore);

  isProductsLoading = this.store.isProductsLoading;
  isProductsLoaded = this.store.isProductsLoaded;
  productsError = this.store.productsError;
  productsCallStatus = this.store.productsCallStatus;

  productsCurrentPage = this.store.productsCurrentPage;
  productsPagination = this.store.productsPagination;
  productsPagedRequest = this.store.productsPagedRequest;

  productsFilter = this.store.productsFilter;
  isProductsFilterChanged = this.store.isProductsFilterChanged;

  productsSort = this.store.productsSort;

  loadProductsPage(page: number) {
    this.store.loadProductsPage({ page });
  }

  resetProductsFilter() {
    this.store.resetProductsFilter();
  }

  sortProducts() {
    this.store.sortProducts({ field: 'name' });
  }
}
