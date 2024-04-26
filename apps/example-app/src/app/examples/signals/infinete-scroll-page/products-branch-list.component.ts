import { BreakpointObserver } from '@angular/cdk/layout';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatList, MatListItem } from '@angular/material/list';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { getInfiniteScrollDataSource } from '@ngrx-traits/signals';
import { map } from 'rxjs/operators';

import { Branch } from '../../models';
import { ProductsBranchStore } from './products-branch.store';

@Component({
  selector: 'products-branch-list',
  standalone: true,
  imports: [
    CommonModule,
    MatList,
    MatListItem,
    MatButton,
    MatIcon,
    MatFormField,
    MatInput,
    FormsModule,
    MatLabel,
    MatProgressSpinner,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
  ],
  template: `
    <div class="grid grid-rows-[auto_1fr]">
      <form class="p-8 pb-0">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Search</mat-label>
          <input
            type="text"
            matInput
            [ngModel]="store.entitiesFilter().search"
            name="search"
            (ngModelChange)="
              store.filterEntities({ filter: { search: $event } })
            "
          />
        </mat-form-field>
      </form>

      @if (isMobile()) {
        <cdk-virtual-scroll-viewport
          itemSize="42"
          class="fact-scroll-viewport"
          minBufferPx="200"
          maxBufferPx="200"
        >
          <mat-list>
            <mat-list-item
              *cdkVirtualFor="let item of dataSource; trackBy: trackByFn"
              >{{ item.name }}</mat-list-item
            >
          </mat-list>
        </cdk-virtual-scroll-viewport>
      } @else {
        @if (store.entitiesCurrentPage().isLoading) {
          <mat-spinner />
        } @else {
          <mat-list>
            @for (
              product of store.entitiesCurrentPage().entities;
              track product.id
            ) {
              <mat-list-item>{{ product.name }}</mat-list-item>
            }
          </mat-list>
          <div>
            <button
              mat-button
              [disabled]="!store.entitiesCurrentPage().hasPrevious"
              (click)="store.loadEntitiesPreviousPage()"
            >
              previous
            </button>
            <button
              mat-button
              [disabled]="!store.entitiesCurrentPage().hasNext"
              (click)="store.loadEntitiesNextPage()"
            >
              next
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100dvh;
    }
    .fact-scroll-viewport {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow-y: auto;
      overflow-x: hidden;
      height: 80dvh;
      width: 100%;
    }
  `,
  providers: [ProductsBranchStore],
})
export class ProductsBranchListComponent {
  store = inject(ProductsBranchStore);
  dataSource = getInfiniteScrollDataSource({ store: this.store });
  breakpointObserver = inject(BreakpointObserver);
  isMobile = toSignal(
    this.breakpointObserver
      .observe('(max-width: 640px)')
      .pipe(map((result) => result.matches)),
  );

  trackByFn(index: number, item: Branch) {
    return item.id;
  }
}
