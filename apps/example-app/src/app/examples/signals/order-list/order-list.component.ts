import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem } from '@angular/material/list';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { OrderStore } from './order-list.store';

@Component({
  selector: 'order-list',
  standalone: true,
  template: `
    <a mat-raised-button routerLink="/signals" class="mb-4">Back to Examples</a>
    <mat-card>
      <mat-card-content>
      <mat-list role="list">
        @for (order of store.orderEntities(); track order.id) {
          <mat-list-item
            role="listitem"
            (click)="store.toggleShowDetail(order)"
            class="order-item !cursor-pointer"
          >
            <div class="flex gap-4">
              <mat-icon class="expand-icon">
                {{
                  store.orderIdsSelectedMap()[order.id]
                    ? 'expand_more'
                    : 'chevron_right'
                }}
              </mat-icon>
              <span
                ><strong>Order #{{ order.id }}</strong></span
              >
              <span>{{ order.userName }} ({{ order.userEmail }})</span>
              <span>Total: \${{ order.total }}</span>
            </div>
          </mat-list-item>

          <!-- Expanded Section (Order Details) -->
          @if (store.orderIdsSelectedMap()[order.id]) {
            @if (store.isLoadOrderDetailLoaded(order.id)) {
              <div class="expanded-content ml-12">
                <mat-list dense>
                  @for (item of order.items; track item.id) {
                    <mat-list-item>
                      <span>{{ item.name }}</span> - \${{ item.price }}
                    </mat-list-item>
                  }
                </mat-list>
              </div>
            } @else {
              <mat-spinner class="mx-auto my-4" />
            }
          }
        }
      </mat-list>
    </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./order-list.component.scss'],
  providers: [OrderStore],
  imports: [
    MatIcon,
    MatListItem,
    MatList,
    MatCardContent,
    MatCard,
    MatProgressSpinner,
    MatButton,
    RouterLink,
  ],
})
export class OrderListComponent {
  store = inject(OrderStore);
}
