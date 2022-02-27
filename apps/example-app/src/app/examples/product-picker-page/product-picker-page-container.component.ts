import { Component } from '@angular/core';

@Component({
  selector: 'ngrx-traits-product-list-example-container',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Product List</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <product-picker></product-picker>
      </mat-card-content>
    </mat-card>
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
export class ProductPickerPageContainerComponent {}
