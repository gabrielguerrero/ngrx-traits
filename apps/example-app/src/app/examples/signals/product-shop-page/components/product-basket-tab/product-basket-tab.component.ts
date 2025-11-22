import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Product } from '@example-api/shared/models';
import { Sort } from '@ngrx-traits/common';

import { ProductBasketComponent } from '../../../../components/product-basket/product-basket.component';
import { ProductsShopStore } from '../../products-shop.store';
import { SmartProductDetailComponent } from '../smart-product-detail/smart-product-detail.component';

@Component({
  selector: 'product-basket-tab',
  template: `
    <div class="grid gap-4 m-8">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Product Basket</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <product-basket
            [list]="store.orderItemsEntities()"
            [isAllSelectedForRemove]="store.isAllOrderItemsSelected()"
            [selectedForRemoveIds]="store.orderItemsIdsSelectedMap()"
            (updateProduct)="store.updateProductInBasket($event)"
            (toggleSelectForRemove)="
              store.toggleSelectOrderItemsEntities($event)
            "
            (toggleAllSelectForRemove)="
              store.toggleSelectAllOrderItemsEntities()
            "
            [selectedProduct]="store.productsEntitySelected()"
            (selectProduct)="store.selectProductsEntity($event)"
            (sort)="sortBasket($event)"
          ></product-basket>
        </mat-card-content>
        <mat-card-actions class="flex gap-4" [align]="'end'">
          <button
            mat-stroked-button
            color="primary"
            type="submit"
            [disabled]="store.isAllOrderItemsSelected() === 'none'"
            (click)="store.removeProductsFromBasket()"
          >
            REMOVE
          </button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="
              !store.orderItemsEntities().length || store.isCheckoutLoading()
            "
            (click)="store.checkout()"
          >
            @if (store.isCheckoutLoading()) {
              <mat-spinner [diameter]="20"></mat-spinner>
            }
            <span>CHECKOUT</span>
          </button>
        </mat-card-actions>
      </mat-card>
      @if (store.productsEntitySelected()) {
        <smart-product-detail
          [productId]="store.productsEntitySelected()!.id"
        />
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
    MatProgressSpinnerModule,
    ProductBasketComponent,
    MatButtonModule,
    SmartProductDetailComponent,
  ],
})
export class ProductBasketTabComponent {
  store = inject(ProductsShopStore);

  sortBasket(sort: Sort<Product>) {
    this.store.sortOrderItemsEntities({
      sort: { field: sort.active, direction: sort.direction },
    });
  }
}
