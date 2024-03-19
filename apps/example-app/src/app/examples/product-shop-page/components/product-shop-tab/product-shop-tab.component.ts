import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { ProductActions, ProductSelectors } from '../../state/products';
import { first, map } from 'rxjs/operators';
import { ProductBasketActions } from '../../state/products-basket/products-basket.traits';
import { createSelector, Store } from '@ngrx/store';
import { Product, ProductFilter } from '../../../models';
import { Sort } from '@ngrx-traits/common';
import { ProductDetailComponent } from '../../../components/product-detail/product-detail.component';
import { ProductListComponent } from '../../../components/product-list/product-list.component';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductSearchFormComponent } from '../../../components/product-search-form/product-search-form.component';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'product-shop-tab',
  template: `
    @if (products$ | async; as data) {
    <div class="m-8 grid sm:grid-cols-2" style="gap: 10px">
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
            [list]="data.products"
            [selectedProduct]="data.selectedProduct"
            (selectProduct)="select($event)"
            (sort)="sort($event)"
          ></product-list>
          }
        </mat-card-content>
        <mat-card-actions [align]="'end'">
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="!data.selectedProduct"
            (click)="addToBasket()"
          >
            <span>ADD TO BASKET</span>
          </button>
        </mat-card-actions>
      </mat-card>
      <product-detail
        [product]="data.selectedProduct"
        [productLoading]="data.isLoadProductDetail"
      ></product-detail>
    </div>
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
    ProductSearchFormComponent,
    MatProgressSpinnerModule,
    MatButtonModule,
    ProductListComponent,
    ProductDetailComponent,
    AsyncPipe,
  ],
})
export class ProductShopTabComponent implements OnInit {
  products$ = this.store.select(
    createSelector({
      filters: ProductSelectors.selectProductsFilter,
      products: ProductSelectors.selectProductsList,
      isLoading: ProductSelectors.isProductsLoading,
      selectedProduct: ProductSelectors.selectProductDetail,
      isLoadProductDetail: ProductSelectors.isLoadingLoadProductDetail,
    })
  );

  constructor(private store: Store) {}

  ngOnInit() {
    this.store
      .select(ProductSelectors.isProductsLoadingSuccess)
      .pipe(first())
      .subscribe(
        (loaded) =>
          !loaded && this.store.dispatch(ProductActions.loadProducts())
      );
  }

  select({ id }: Product) {
    this.store.dispatch(ProductActions.selectProduct({ id }));
    this.store.dispatch(ProductActions.loadProductDetail({ id }));
  }

  filter(filters: ProductFilter | undefined) {
    filters && this.store.dispatch(ProductActions.filterProducts({ filters }));
  }

  sort(sort: Sort<Product>) {
    this.store.dispatch(ProductActions.sortProducts(sort));
  }

  addToBasket() {
    this.products$
      .pipe(
        first(),
        map((products) => products.selectedProduct)
      )
      .subscribe(
        (selectedProduct) =>
          selectedProduct &&
          this.store.dispatch(
            ProductBasketActions.addProductOrders(selectedProduct)
          )
      );
  }
}
