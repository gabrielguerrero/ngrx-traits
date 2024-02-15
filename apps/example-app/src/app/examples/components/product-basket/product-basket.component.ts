import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { Product, ProductOrder } from '../../models';
import { Selected, Sort } from '@ngrx-traits/common';
import { Dictionary } from '@ngrx/entity';
import { UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { rebuildFormArray } from '../../utils/form-utils';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'product-basket',
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
        <ng-container matColumnDef="select">
          <th mat-header-cell *matHeaderCellDef>
            <mat-checkbox
              (change)="$event ? toggleAllSelectForRemove.emit() : null"
              [checked]="isAllSelectedForRemove === 'all'"
              [indeterminate]="isAllSelectedForRemove === 'some'"
            >
            </mat-checkbox>
          </th>
          <td mat-cell *matCellDef="let row">
            <mat-checkbox
              (click)="$event.stopPropagation()"
              (change)="$event ? toggleSelectForRemove.emit(row) : null"
              [checked]="!!selectedForRemoveIds[row.id]"
            >
            </mat-checkbox>
          </td>
        </ng-container>
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
        <ng-container matColumnDef="quantity">
          <th mat-header-cell mat-sort-header *matHeaderCellDef>Quantity</th>
          <td
            mat-cell
            *matCellDef="let row; let index = index"
            [formGroup]="$any(controls?.at(index))"
          >
            <mat-form-field>
              <input
                matInput
                type="number"
                min="1"
                formControlName="quantity"
                #input
                (focus)="input.select()"
              />
            </mat-form-field>
          </td>
        </ng-container>
        <ng-container matColumnDef="total">
          <th mat-header-cell mat-sort-header *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let row">
            {{ row.price * (row.quantity || 1) | currency }}
          </td>
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
        background-color: #009688;
      }
      mat-form-field {
        width: 40px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductBasketComponent implements OnDestroy {
  controls = new UntypedFormArray([]);
  _list: ProductOrder[] = [];
  destroy$ = new Subject<void>();
  displayedColumns: (keyof ProductOrder | 'select' | 'total')[] = [
    'select',
    'id',
    'name',
    'description',
    'price',
    'quantity',
    'total',
  ];

  @Input()
  set list(values: ProductOrder[]) {
    this._list = values;
    rebuildFormArray({
      form: this.controls,
      buildRow: (value: ProductOrder, index) => {
        const rowControl = this.fb.group({
          id: [],
          quantity: [value?.quantity ?? 1],
        });
        rowControl.valueChanges
          .pipe(takeUntil(this.destroy$))
          .subscribe(({ quantity }) =>
            this.updateProduct.emit({ ...this._list[index], quantity })
          );
        return rowControl;
      },
      values,
      selectId: (value) => value.id,
    });
  }

  get list() {
    return this._list;
  }

  @Input() selectedSort: Sort<ProductOrder> = {
    active: 'name',
    direction: 'asc',
  };
  @Input() selectedProduct: ProductOrder | undefined;
  @Input() selectedForRemoveIds: Dictionary<boolean> = {};
  @Input() isAllSelectedForRemove: Selected = 'none';

  @Output() sort = new EventEmitter<Sort<Product>>();
  @Output() selectProduct = new EventEmitter<ProductOrder>();
  @Output() toggleAllSelectForRemove = new EventEmitter<void>();
  @Output() toggleSelectForRemove = new EventEmitter<ProductOrder>();
  @Output() updateProduct = new EventEmitter<ProductOrder>();

  constructor(private fb: UntypedFormBuilder) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
