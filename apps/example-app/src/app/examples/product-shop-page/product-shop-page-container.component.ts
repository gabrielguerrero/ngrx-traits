import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { ProductBasketSelectors } from './state/products-basket/products-basket.traits';

@Component({
  selector: 'ngrx-traits-product-list-example-container',
  template: `
    <nav mat-tab-nav-bar *ngIf="basket$ | async as basket">
      <a
        mat-tab-link
        routerLinkActive
        routerLink="shop"
        #rla="routerLinkActive"
        [active]="rla.isActive"
      >
        Shop
      </a>
      <a
        mat-tab-link
        routerLinkActive
        routerLink="basket"
        #rla2="routerLinkActive"
        [active]="rla2.isActive"
      >
        Basket
        <mat-icon
          [matBadge]="basket.total"
          matBadgeColor="warn"
          matBadgeOverlap="false"
          matBadgeSize="small"
          [matBadgeHidden]="basket.total === 0"
          >shopping_cart</mat-icon
        >
      </a>
    </nav>
    <router-outlet></router-outlet>
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
export class ProductShopPageContainerComponent {
  basket$ = this.store
    .select(ProductBasketSelectors.selectProductOrdersTotal)
    .pipe(map((total) => ({ total })));

  constructor(private store: Store) {}
}
