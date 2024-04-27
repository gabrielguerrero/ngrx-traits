import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Sort } from '@ngrx-traits/common';

import { Product } from '../../models';

@Component({
  selector: 'product-list',

  template: `
    <div class="container">
      <table
        mat-table
        style="width: 100%"
        [dataSource]="list()"
        matSort
        [matSortActive]="selectedSort().active"
        [matSortDirection]="selectedSort().direction"
        matSortDisableClear
        (matSortChange)="sort.emit($any($event))"
      >
        <ng-container matColumnDef="id">
          <th mat-header-cell mat-sort-header *matHeaderCellDef>Id</th>
          <td mat-cell *matCellDef="let row">{{ row.id }}</td>
        </ng-container>
        <ng-container matColumnDef="name">
          <th mat-header-cell mat-sort-header *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let row">{{ row.name }}</td>
        </ng-container>
        <ng-container matColumnDef="description">
          <th mat-header-cell mat-sort-header *matHeaderCellDef>Description</th>
          <td mat-cell *matCellDef="let row">{{ row.description }}</td>
        </ng-container>
        <ng-container matColumnDef="price">
          <th mat-header-cell mat-sort-header *matHeaderCellDef>Price</th>
          <td mat-cell *matCellDef="let row">{{ row.price | currency }}</td>
        </ng-container>

        <tr
          mat-header-row
          *matHeaderRowDef="displayedColumns; sticky: true"
        ></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: displayedColumns"
          [class.selected]="selectedProduct()?.id === row.id"
          (click)="selectProduct.emit(row)"
        ></tr>
      </table>
    </div>
  `,
  styles: [
    `
      .container {
        height: 400px;
        overflow: auto;
      }
      .selected {
        background-color: #009688;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatTableModule, MatSortModule, CurrencyPipe],
})
export class ProductListComponent {
  list = input.required<Product[]>();
  selectedSort = input<Sort<Product>>({ active: 'name', direction: 'asc' });
  selectedProduct = input<Product>();

  sort = output<Sort<Product>>();
  selectProduct = output<Product>();

  displayedColumns: (keyof Product)[] = ['id', 'name', 'description', 'price'];
}
