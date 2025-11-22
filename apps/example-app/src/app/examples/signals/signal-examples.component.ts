import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatLineModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ngrx-traits-examples',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Traits examples</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-list>
          <mat-list-item [routerLink]="'infinite-scroll-dropdown'">
            <div matListItemTitle><b>Infinite Scroll Dropdown</b></div>
            <div matListItemLine>
              Example of withEntitiesRemoteScrollPagination used to create a
              dropdown with infinite scroll
            </div>
          </mat-list-item>
          <mat-list-item [routerLink]="'infinite-scroll-list'">
            <div matListItemTitle><b>Infinite Scroll List</b></div>
            <div matListItemLine>
              Example of withEntitiesRemoteScrollPagination used to create a
              list tha is paginated for desktop mode and uses an infinite scroll
              in mobile mode
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item [routerLink]="'product-list-paginated'">
            <div matListItemTitle><b>Paginated List</b></div>
            <div matListItemLine>
              Example using store features to load a product list with remote
              filtering and detail view
            </div>
          </mat-list-item>
          <mat-list-item [routerLink]="'product-list-ssr'">
            <div matListItemTitle><b>SSR Product List</b></div>
            <div matListItemLine>
              Example with SSR state hydration using withServerStateTransfer.
              URL params pre-hydrate from server
            </div>
          </mat-list-item>
          <mat-list-item [routerLink]="'products-shop'" style="height: 90px;">
            <div matListItemTitle>
              <b
                >Complex example using two collections and most of the store
                features</b
              >
            </div>
            <div matListItemLine style="white-space: normal">
              Example using two collection in the store, one for products and
              one for a product basket, you can find here examples of withCalls,
              remote pagination,sorting and filtering , local sorting,
              pagination, single and multi selection and more
            </div>
          </mat-list-item>
          <mat-list-item [routerLink]="'order-list'">
            <div matListItemTitle><b>Drill-down List</b></div>
            <div matListItemLine>
              Example using store features to load a order list where you can
              expand each order to see the order details, this uses
              withEntitiesCalls to allow you to load the order details
            </div>
          </mat-list-item>
        </mat-list>
      </mat-card-content>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatCardModule,
    MatListModule,
    RouterLink,
    MatLineModule,
    MatDividerModule,
  ],
})
export class SignalExamplesComponent {}
