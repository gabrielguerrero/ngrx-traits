import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import { ProductsBasketStateModule } from './state/products-basket/products-basket-state.module';
import { ProductBasketSelectors } from './state/products-basket/products-basket.traits';
import { ProductsStateModule } from './state/products/products-state.module';

@Component({
  selector: 'ngrx-traits-product-list-example-container',
  template: `
    @if (basket$ | async; as basket) {
      <nav mat-tab-nav-bar>
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
    }
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
  standalone: true,
  imports: [
    MatTabsModule,
    RouterLinkActive,
    RouterLink,
    MatIconModule,
    MatBadgeModule,
    RouterOutlet,
    AsyncPipe,
    ProductsStateModule,
    ProductsBasketStateModule,
  ],
})
export class ProductShopPageContainerComponent {
  basket$ = this.store
    .select(ProductBasketSelectors.selectProductOrdersTotal)
    .pipe(map((total) => ({ total })));

  constructor(private store: Store) {}
}
