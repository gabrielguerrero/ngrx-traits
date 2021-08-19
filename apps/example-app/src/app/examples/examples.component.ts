import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

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
            <div mat-line><b>Simple List</b></div>
            <div mat-line>
              Example using trait to load a product list with filtering and
              sorting in memory
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item [routerLink]="'product-list-paginated'">
            <div mat-line><b>Paginated List</b></div>
            <div mat-line>
              Example using trait to load a product list with remote filtering
              and sorting and pagination
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item [routerLink]="'product-picker'">
            <div mat-line><b>Local store example with a product picker</b></div>
            <div mat-line>
              Example using local traits to load a product list with filtering
              and sorting in memory
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item [routerLink]="'product-shop'" style="height: 110px;">
            <div mat-line>
              <b>Using addCrudEntities and creating loadProduct custom trait</b>
            </div>
            <div mat-line style="white-space: normal">
              This is a more complex example were we add a product basket, so
              you can buy more than one product at a time. Here you will see how
              to use the addCrudEntities and we create a custom trait called
              loadProduct to help with the preview of the product
            </div>
          </mat-list-item>
        </mat-list>
      </mat-card-content>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamplesComponent {}
