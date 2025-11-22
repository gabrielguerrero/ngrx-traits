import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Product, ProductOrder } from '@example-api/shared/models';
import { Sort } from '@ngrx-traits/common';
import { createSelector, Store } from '@ngrx/store';
import { first } from 'rxjs/operators';

import { ProductBasketComponent } from '../../../../components/product-basket/product-basket.component';
import { ProductDetailComponent } from '../../../../components/product-detail/product-detail.component';
import {
  ProductBasketActions,
  ProductBasketSelectors,
} from '../../state/products-basket/products-basket.traits';

@Component({
  selector: 'product-basket-tab',
  template: `
    @if (basket$ | async; as data) {
      <div gdColumns="700px 500px" style="gap: 10px">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Product Basket</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (data.isLoading) {
              <mat-spinner></mat-spinner>
            } @else {
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
            }
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
              @if (data.isLoadingCheckout) {
                <mat-spinner [diameter]="20"></mat-spinner>
              }
              <span>CHECKOUT</span>
            </button>
          </mat-card-actions>
        </mat-card>
        <product-detail [product]="data.selectedProduct"></product-detail>
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
    MatProgressSpinnerModule,
    ProductBasketComponent,
    MatButtonModule,
    ProductDetailComponent,
    AsyncPipe,
  ],
})
export class ProductBasketTabComponent {
  basket$ = this.store.select(
    createSelector({
      products: ProductBasketSelectors.selectProductOrdersList,
      isLoading: ProductBasketSelectors.isProductOrdersLoading,
      selectedProductsIdsToRemove:
        ProductBasketSelectors.selectProductOrdersIdsSelectedMap,
      selectedProduct: ProductBasketSelectors.selectProductDetail,
      isAllSelected: ProductBasketSelectors.isAllProductOrdersSelected,
      isLoadingCheckout: ProductBasketSelectors.isLoadingCheckout,
    }),
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
            ProductBasketActions.removeProductOrders(...productsToRemove),
          ),
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
      ProductBasketActions.updateProductOrders({ id, changes: { quantity } }),
    );
  }
}
