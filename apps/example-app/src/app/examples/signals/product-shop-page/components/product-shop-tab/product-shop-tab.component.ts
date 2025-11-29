import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Product, ProductFilter } from '@example-api/shared/models';
import { Sort } from '@ngrx-traits/common';

import { ProductDetailComponent } from '../../../../components/product-detail/product-detail.component';
import { ProductListComponent } from '../../../../components/product-list/product-list.component';
import { ProductSearchFormComponent } from '../../../../components/product-search-form/product-search-form.component';
import { ProductsShopStore } from '../../products-shop.store';

@Component({
  selector: 'product-shop-tab',
  template: `
    <div class="sm:m-4 grid sm:grid-cols-2 gap-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Product List</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <product-search-form
            class="m-2"
            [searchProduct]="store.productEntitiesFilter()"
            (searchProductChange)="filter($event)"
          />
          @if (store.productEntitiesCurrentPage().isLoading) {
            <mat-spinner />
          } @else {
            <product-list
              [list]="store.productEntitiesCurrentPage().entities"
              [selectedProduct]="store.productEntitySelected()"
              (selectProduct)="select($event)"
              [selectedSort]="materialSort()"
              (sort)="sort($event)"
            />
            <mat-paginator
              [pageSizeOptions]="[5, 10, 25, 100]"
              [length]="store.productEntitiesCurrentPage().total"
              [pageSize]="store.productEntitiesCurrentPage().pageSize"
              [pageIndex]="store.productEntitiesCurrentPage().pageIndex"
              (page)="store.loadProductEntitiesPage($event)"
            />
          }
        </mat-card-content>
        <mat-card-actions [align]="'end'">
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="!store.productEntitySelected()"
            (click)="store.addProductToBasket()"
          >
            <span>ADD TO BASKET</span>
          </button>
        </mat-card-actions>
      </mat-card>
      @if (store.isLoadProductDetailLoading()) {
        <mat-spinner />
      } @else if (store.isLoadProductDetailLoaded()) {
        <product-detail [product]="store.loadProductDetailResult()!" />
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
    MatPaginator,
  ],
})
export class ProductShopTabComponent {
  store = inject(ProductsShopStore);

  materialSort = computed(() => {
    return {
      active: this.store.productEntitiesSort().field as keyof Product,
      direction: this.store.productEntitiesSort().direction,
    };
  });
  select({ id }: Product) {
    this.store.selectProductEntity({ id });
    this.store.loadProductDetail({ id });
  }

  filter(filter: ProductFilter | undefined) {
    filter && this.store.filterProductEntities({ filter });
  }

  sort(sort: Sort<Product>) {
    this.store.sortProductEntities({
      sort: { field: sort.active, direction: sort.direction },
    });
    console.log({ sort });
  }
}
