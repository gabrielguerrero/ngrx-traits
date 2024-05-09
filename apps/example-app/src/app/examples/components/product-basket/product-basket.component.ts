import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnDestroy,
  output,
} from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Selected, Sort } from '@ngrx-traits/common';
import { Dictionary } from '@ngrx/entity';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Product, ProductOrder } from '../../models';
import { rebuildFormArray } from '../../utils/form-utils';

@Component({
  selector: 'product-basket',

  template: `
    <div class="container">
      <table
        mat-table
        style="width: 100%"
        [dataSource]="listControls()"
        matSort
        [matSortActive]="selectedSort().active"
        [matSortDirection]="selectedSort().direction"
        matSortDisableClear
        (matSortChange)="sort.emit($any($event))"
      >
        <ng-container matColumnDef="select">
          <th mat-header-cell *matHeaderCellDef>
            <mat-checkbox
              (change)="$event ? toggleAllSelectForRemove.emit() : null"
              [checked]="isAllSelectedForRemove() === 'all'"
              [indeterminate]="isAllSelectedForRemove() === 'some'"
            >
            </mat-checkbox>
          </th>
          <td mat-cell *matCellDef="let row">
            <mat-checkbox
              (click)="$event.stopPropagation()"
              (change)="$event ? toggleSelectForRemove.emit(row) : null"
              [checked]="!!selectedForRemoveIds()[row.id]"
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
            [formGroup]="$any(controls.at(index))"
            class="!p-2"
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
          <th mat-header-cell *matHeaderCellDef>Total</th>
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
      mat-form-field {
        width: 50px;
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CurrencyPipe,
  ],
})
export class ProductBasketComponent implements OnDestroy {
  controls = new UntypedFormArray([]);
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
  list = input.required<ProductOrder[]>();

  protected listControls = computed(() => {
    const values = this.list();
    rebuildFormArray({
      form: this.controls,
      buildRow: (value: ProductOrder, index) => {
        const rowControl = this.fb.group({
          id: [],
          quantity: [value?.quantity ?? 1],
        });
        rowControl.valueChanges
          .pipe(takeUntil(this.destroy$))
          .subscribe(({ quantity }) => {
            console.log('updateProduct', { ...this.list()[index], quantity });
            this.updateProduct.emit({ ...this.list()[index], quantity });
          });
        return rowControl;
      },
      values,
      selectId: (value) => value.id,
    });
    return values;
  });

  selectedSort = input<Sort<ProductOrder>>({
    active: 'name',
    direction: 'asc',
  });
  selectedProduct = input<ProductOrder>();
  selectedForRemoveIds = input<Dictionary<boolean>>({});
  isAllSelectedForRemove = input<Selected>('none');

  sort = output<Sort<Product>>();
  selectProduct = output<ProductOrder>();
  toggleAllSelectForRemove = output<void>();
  toggleSelectForRemove = output<ProductOrder>();
  updateProduct = output<ProductOrder>();

  constructor(private fb: UntypedFormBuilder) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
