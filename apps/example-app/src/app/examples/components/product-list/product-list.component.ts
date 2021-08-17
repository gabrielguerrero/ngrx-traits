import {
  Component,
  OnInit,
  EventEmitter,
  ChangeDetectionStrategy,
  Output,
  Input,
} from '@angular/core';
import { Product } from '../../models';
import { Sort } from 'ngrx-traits/traits';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'product-list',
  template: `
    <div class="container">
      <table
        mat-table
        style="width: 100%"
        [dataSource]="list"
        matSort
        [matSortActive]="selectedSort.active"
        [matSortDirection]="selectedSort.direction"
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
          [class.selected]="selectedProduct?.id === row.id"
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
        background-color: lightblue;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  @Input() list: Product[] = [];
  @Input() selectedSort: Sort<Product> = { active: 'name', direction: 'asc' };
  @Input() selectedProduct: Product | undefined;

  @Output() sort = new EventEmitter<Sort<Product>>();
  @Output() selectProduct = new EventEmitter<Product>();

  displayedColumns: (keyof Product)[] = ['id', 'name', 'description', 'price'];
}
