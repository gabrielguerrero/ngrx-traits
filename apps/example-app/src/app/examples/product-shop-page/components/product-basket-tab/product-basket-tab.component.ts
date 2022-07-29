import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { first, map } from 'rxjs/operators';
import {
  ProductBasketActions,
  ProductBasketSelectors,
} from '../../state/products-basket/products-basket.traits';
import { Store } from '@ngrx/store';
import { Product, ProductOrder } from '../../../models';
import { Sort } from '@ngrx-traits/common';

@Component({
  selector: 'product-basket-tab',
  template: `
    <div
      gdColumns="700px 500px"
      style="gap: 10px"
      *ngIf="basket$ | async as data"
    >
      <mat-card>
        <mat-card-header>
          <mat-card-title>Product Basket</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-spinner *ngIf="data.isLoading; else listProducts"></mat-spinner>
          <ng-template #listProducts>
            <product-basket
              [list]="data.products"
              [isAllSelectedForRemove]="data.isAllSelected"
              [selectedForRemoveIds]="data.selectedProductsIdsToRemove"
              [selectedProduct]="data.selectedProduct"
              (selectProduct)="selectBasket($event)"
              (updateProduct)="updateProduct($event)"
              (toggleSelectForRemove)="removeToggleSelect($event)"
              (toggleAllSelectForRemove)="removeToggleAll()"
              (sort)="sortBasket($event)"
            ></product-basket>
          </ng-template>
        </mat-card-content>
        <mat-card-actions [align]="'end'">
          <button
            mat-stroked-button
            color="primary"
            type="submit"
            [disabled]="data.isAllSelected === 'none'"
            (click)="remove()"
          >
            REMOVE
          </button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="!data.products.length || data.isLoadingCheckout"
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
      <product-detail [product]="data.selectedProduct"></product-detail>
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
export class ProductBasketTabComponent {
  basket$ = combineLatest([
    this.store.select(ProductBasketSelectors.selectProductOrdersList),
    this.store.select(ProductBasketSelectors.isProductOrdersLoading),
    this.store.select(ProductBasketSelectors.selectProductOrdersIdsSelectedMap),
    this.store.select(ProductBasketSelectors.selectProductDetail),
    this.store.select(ProductBasketSelectors.isAllProductOrdersSelected),
    this.store.select(ProductBasketSelectors.isCheckoutLoading),
  ]).pipe(
    map(
      ([
        products,
        isLoading,
        selectedProductsIdsToRemove,
        selectedProduct,
        isAllSelected,
        isLoadingCheckout,
      ]) => ({
        products,
        isLoading,
        selectedProductsIdsToRemove,
        selectedProduct,
        isAllSelected,
        isLoadingCheckout,
      })
    )
  );

  constructor(private store: Store) {}

  selectBasket({ id }: Product) {
    this.store.dispatch(ProductBasketActions.selectProductOrder({ id }));
    this.store.dispatch(ProductBasketActions.loadProductDetail({ id }));
  }

  checkout() {
    this.store.dispatch(ProductBasketActions.checkout());
  }

  sortBasket(sort: Sort<Product>) {
    this.store.dispatch(ProductBasketActions.sortProductOrders(sort));
  }

  remove() {
    this.store
      .select(ProductBasketSelectors.selectProductOrdersIdsSelectedList)
      .pipe(first())
      .subscribe(
        (productsToRemove) =>
          productsToRemove &&
          this.store.dispatch(
            ProductBasketActions.removeProductOrders(...productsToRemove)
          )
      );
  }

  removeToggleSelect({ id }: Product) {
    this.store.dispatch(ProductBasketActions.toggleSelectProductOrders({ id }));
  }

  removeToggleAll() {
    this.store.dispatch(ProductBasketActions.toggleSelectAllProductOrders());
  }

  updateProduct({ id, quantity }: ProductOrder) {
    this.store.dispatch(
      ProductBasketActions.updateProductOrders({ id, changes: { quantity } })
    );
  }
}
