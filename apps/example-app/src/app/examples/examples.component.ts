import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatLineModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'ngrx-traits-examples',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Traits examples</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-list>
          <mat-list-item [routerLink]="'product-list'">
            <div matListItemTitle><b>Simple List</b></div>
            <div matListItemLine>
              Example using trait to load a product list with filtering and
              sorting in memory
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item [routerLink]="'product-list-paginated'">
            <div matListItemTitle><b>Paginated List</b></div>
            <div matListItemLine>
              Example using trait to load a product list with remote filtering
              and sorting and pagination
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item [routerLink]="'product-picker'">
            <div matListItemTitle>
              <b>Local store example with a product picker</b>
            </div>
            <div matListItemLine>
              Example using local traits to load a product list with filtering
              and sorting in memory
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item [routerLink]="'product-shop'" style="height: 90px;">
            <div matListItemTitle>
              <b>Using addCrudEntities and creating loadProduct custom trait</b>
            </div>
            <div matListItemLine style="white-space: normal">
              This is a more complex example were we add a product basket, so
              you can buy more than one product at a time. Here you will see how
              to use the addCrudEntities and we create a custom trait called
              loadProduct to help with the preview of the product
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item
            [routerLink]="'cache-and-dropdowns'"
            style="height: 110px;"
          >
            <div matListItemTitle>
              <b>Example using local traits in dropdowns with cache</b>
            </div>
            <div matListItemLine style="white-space: normal">
              Here you can see how to use local store in two dropdowns where
              selecting one trigger a load in the second, plus how you can use
              cache to reduce the number of calls they do
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
export class ExamplesComponent {}
