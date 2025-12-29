import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { createProductsStore } from '../products.store';

@Component({
  selector: 'app-products',
  standalone: true,
  template: `
    <div>
      <p>Loading: {{ isProductsEntitiesLoading() }}</p>
      <p>Error: {{ productsEntitiesError() }}</p>
      <p>Current Page: {{ productsEntitiesCurrentPage() }}</p>
      <p>Filter: {{ productsEntitiesFilter() }}</p>
      <p>Sort: {{ productsEntitiesSort() }}</p>
      <button (click)="loadProductsEntitiesPage(1)">Load Page</button>
      <button (click)="resetProductsEntitiesFilter()">Reset Filter</button>
      <button (click)="sortProductsEntities()">Sort</button>
    </div>
  `
})
export class ProductsComponent {
  store = inject(createProductsStore);

  isProductsEntitiesLoading = this.store.isProductsEntitiesLoading;
  isProductsEntitiesLoaded = this.store.isProductsEntitiesLoaded;
  productsEntitiesError = this.store.productsEntitiesError;
  productsEntitiesCallStatus = this.store.productsEntitiesCallStatus;

  productsEntitiesCurrentPage = this.store.productsEntitiesCurrentPage;
  productsEntitiesPagination = this.store.productsEntitiesPagination;
  productsEntitiesPagedRequest = this.store.productsEntitiesPagedRequest;

  productsEntitiesFilter = this.store.productsEntitiesFilter;
  isProductsEntitiesFilterChanged = this.store.isProductsEntitiesFilterChanged;

  productsEntitiesSort = this.store.productsEntitiesSort;

  loadProductsEntitiesPage(page: number) {
    this.store.loadProductsEntitiesPage({ page });
  }

  resetProductsEntitiesFilter() {
    this.store.resetProductsEntitiesFilter();
  }

  sortProductsEntities() {
    this.store.sortProductsEntities({ field: 'name' });
  }
}
