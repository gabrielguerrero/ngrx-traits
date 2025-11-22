import { Component, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { orderStatusArray } from '@example-api/shared/models';

import { OrderStore } from './order-list.store';

@Component({
  selector: 'order-list',
  standalone: true,
  template: `
    <a mat-raised-button routerLink="/signals" class="mb-4">Back to Examples</a>
    <mat-card>
      <mat-card-content>
        <table
          mat-table
          [dataSource]="store.ordersEntities()"
          class="mat-elevation-z8"
          multiTemplateDataRows
        >
          <!-- ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>Order ID</th>
            <td mat-cell *matCellDef="let order">{{ order.id }}</td>
          </ng-container>

          <!-- User Name Column -->
          <ng-container matColumnDef="userName">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let order">{{ order.userName }}</td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="userEmail">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let order">{{ order.userEmail }}</td>
          </ng-container>

          <!-- Quantity Column -->
          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Quantity</th>
            <td mat-cell *matCellDef="let order">{{ order.quantity }}</td>
          </ng-container>

          <!-- Total Column -->
          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Total ($)</th>
            <td mat-cell *matCellDef="let order">{{ order.total }}</td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let order">
              <mat-form-field appearance="fill">
                @if (store.isChangeOrderStatusLoading(order)) {
                  <mat-progress-spinner
                    matPrefix
                    diameter="20"
                    mode="indeterminate"
                  />
                }
                <mat-select
                  [value]="order.status"
                  (valueChange)="
                    store.changeOrderStatus({ entity: order, status: $event })
                  "
                  [disabled]="store.isChangeOrderStatusLoading(order)"
                  [placeholder]="
                    store.isChangeOrderStatusLoading(order)
                      ? 'Loading...'
                      : 'Status'
                  "
                >
                  @if (!store.isChangeOrderStatusLoading(order)) {
                    @for (option of orderStatusArray; track option.id) {
                      <mat-option [value]="option.id">
                        {{ option.label }}
                      </mat-option>
                    }
                  }
                </mat-select>
              </mat-form-field>
            </td>
          </ng-container>
          <ng-container matColumnDef="delete">
            <th mat-header-cell *matHeaderCellDef>Delete</th>
            <td mat-cell *matCellDef="let order">
              @if (!store.isDeleteOrderLoading(order)) {
                <button mat-icon-button (click)="store.deleteOrder(order)">
                  <mat-icon>delete</mat-icon>
                </button>
              } @else {
                <mat-progress-spinner
                  diameter="20"
                  mode="indeterminate"
                ></mat-progress-spinner>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let order">
              <button mat-icon-button (click)="store.toggleShowDetail(order)">
                <mat-icon>
                  {{
                    store.ordersIdsSelectedMap()[order.id]
                      ? 'expand_less'
                      : 'expand_more'
                  }}
                </mat-icon>
              </button>
            </td>
          </ng-container>

          <ng-container matColumnDef="expandedDetail">
            <td
              mat-cell
              *matCellDef="let order"
              [attr.colspan]="displayedColumns.length"
            >
              <div
                class="example-element-detail-wrapper "
                [class.example-element-detail-wrapper-expanded]="
                  store.ordersIdsSelectedMap()[order.id]
                "
              >
                @if (store.isLoadOrderDetailLoaded(order)) {
                  <div class="example-element-detail grid">
                    <h3 class="text-lg">Order Details</h3>
                    <div>
                      <span class="text-sm font-bold">Address:</span>
                      {{ order.deliveryAddress.line1 }},
                      {{ order.deliveryAddress.town }},
                      {{ order.deliveryAddress.postCode }},
                      {{ order.deliveryAddress.country }}
                    </div>
                    <table
                      mat-table
                      [dataSource]="order.items"
                      class="inner-table !bg-zinc-800"
                    >
                      <ng-container matColumnDef="name">
                        <th mat-header-cell *matHeaderCellDef>Product</th>
                        <td mat-cell *matCellDef="let item">{{ item.name }}</td>
                      </ng-container>

                      <ng-container matColumnDef="description">
                        <th mat-header-cell *matHeaderCellDef>Description</th>
                        <td mat-cell *matCellDef="let item">
                          {{ item.description }}
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="price">
                        <th mat-header-cell *matHeaderCellDef>Price ($)</th>
                        <td mat-cell *matCellDef="let item">
                          {{ item.price }}
                        </td>
                      </ng-container>
                      <tr
                        mat-header-row
                        *matHeaderRowDef="['name', 'description', 'price']"
                      ></tr>
                      <tr
                        mat-row
                        *matRowDef="
                          let item;
                          columns: ['name', 'description', 'price']
                        "
                      ></tr>
                    </table>
                  </div>
                } @else if (store.isLoadOrderDetailLoading(order)) {
                  <mat-spinner class="mx-auto my-4 !w-16 !h-16" />
                }
              </div>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr
            mat-row
            *matRowDef="let order; columns: displayedColumns"
            class="example-element-row"
            [class.example-expanded-row]="
              store.ordersIdsSelectedMap()[order.id]
            "
          ></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: ['expandedDetail']"
            class="example-detail-row"
          ></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./order-table.component.scss'],
  providers: [OrderStore],
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderCellDef,
    MatIconButton,
    MatIcon,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatProgressSpinner,
    MatFormField,
    MatSelect,
    MatOption,
    MatPrefix,
    MatCard,
    MatCardContent,
    MatButton,
    RouterLink,
  ],
})
export class OrderTableComponent {
  store = inject(OrderStore);
  orderStatusArray = orderStatusArray;
  displayedColumns: string[] = [
    'actions',
    'id',
    'userName',
    'userEmail',
    'quantity',
    'total',
    'status',
    'delete',
  ];
}
