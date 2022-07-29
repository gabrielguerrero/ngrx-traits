import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { ProductActions, ProductSelectors } from '../../state/products';
import { first, map } from 'rxjs/operators';
import { ProductBasketActions } from '../../state/products-basket/products-basket.traits';
import { Store } from '@ngrx/store';
import { Product, ProductFilter } from '../../../models';
import { Sort } from '@ngrx-traits/common';

@Component({
  selector: 'product-shop-tab',
  template: `
    <div
      gdColumns="500px 500px"
      style="gap: 10px"
      *ngIf="products$ | async as data"
    >
      <mat-card>
        <mat-card-header>
          <mat-card-title>Product List</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <product-search-form
            (searchProduct)="filter($event)"
          ></product-search-form>
          <mat-spinner *ngIf="data.isLoading; else listProducts"></mat-spinner>
          <ng-template #listProducts>
            <button mat-raised-button (click)="addToBasket()"></button>
            <product-list
              [list]="data.products"
              [selectedProduct]="data.selectedProduct"
              (selectProduct)="select($event)"
              (sort)="sort($event)"
            ></product-list>
          </ng-template>
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
export class ProductShopTabComponent implements OnInit {
  products$ = combineLatest([
    this.store.select(ProductSelectors.selectProductsList),
    this.store.select(ProductSelectors.isProductsLoading),
    this.store.select(ProductSelectors.selectProductDetail),
    this.store.select(ProductSelectors.isLoadProductDetailLoading),
  ]).pipe(
    map(([products, isLoading, selectedProduct, isLoadProductDetail]) => ({
      products,
      isLoading,
      selectedProduct,
      isLoadProductDetail,
    }))
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

  filter(filters: ProductFilter) {
    this.store.dispatch(ProductActions.filterProducts({ filters }));
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
