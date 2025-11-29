import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { ProductsShopStore } from './products-shop.store';

@Component({
  selector: 'ngrx-traits-product-list-example-container',
  template: `
    <a mat-raised-button routerLink="/signals" class="mb-4">Back to Examples</a>
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
          [matBadge]="store.orderItemEntities().length"
          matBadgeColor="warn"
          matBadgeOverlap="false"
          matBadgeSize="small"
          [matBadgeHidden]="store.orderItemEntities().length === 0"
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
  standalone: true,
  imports: [
    MatTabsModule,
    RouterLinkActive,
    RouterLink,
    MatIconModule,
    MatBadgeModule,
    RouterOutlet,
    MatButtonModule,
  ],
})
export class ProductShopPageContainerComponent {
  store = inject(ProductsShopStore);
}
