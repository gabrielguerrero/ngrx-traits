import {
  CdkFixedSizeVirtualScroll,
  CdkScrollableModule,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatOption, MatSelect } from '@angular/material/select';
import { getInfiniteScrollDataSource } from '@ngrx-traits/signals';

import { SearchOptionsComponent } from '../../../../components/search-options/search-options.component';
import { Branch } from '../../../../models';
import { ProductsBranchStore } from './products-branch.store';

@Component({
  selector: 'products-branch-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    MatFormField,
    MatLabel,
    MatSelect,
    SearchOptionsComponent,
    MatOption,
    MatProgressSpinner,
    ReactiveFormsModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
  ],
  template: ` <mat-form-field class="container" floatLabel="always">
    <mat-label>{{ label() }}</mat-label>
    <mat-select
      [formControl]="control"
      [placeholder]="store.isLoading() ? 'Loading...' : placeholder()"
      [compareWith]="compareById"
      (closed)="search('')"
    >
      <search-options (valueChanges)="search($event)"></search-options>
      <cdk-virtual-scroll-viewport
        itemSize="42"
        class="fact-scroll-viewport"
        minBufferPx="200"
        maxBufferPx="200"
      >
        <mat-option
          *ngIf="!!control.value"
          class="fact-item"
          [style]="{ height: 0 }"
          [value]="control.value"
        >
          {{ control.value.name }}
        </mat-option>
        <mat-option
          *cdkVirtualFor="let item of dataSource; trackBy: trackByFn"
          class="fact-item"
          [value]="item"
        >
          {{ item.name }}
        </mat-option>
        <mat-option disabled *ngIf="store.isLoading()">
          <mat-spinner diameter="35"></mat-spinner>
        </mat-option>
      </cdk-virtual-scroll-viewport>
    </mat-select>
  </mat-form-field>`,
  styles: [
    `
      .fact-scroll-viewport {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow-y: auto;
        overflow-x: hidden;
        height: 200px;
        width: 100%;
      }
      :host {
        display: inline-block;
      }
      .container {
        width: 100%;
      }
    `,
  ],
  providers: [ProductsBranchStore],
})
export class ProductsBranchDropdownComponent {
  label = input('Branch');
  placeholder = input('Please Select');
  control = new FormControl();
  store = inject(ProductsBranchStore);
  dataSource = getInfiniteScrollDataSource({ store: this.store });

  search(query: string) {
    this.store.filterEntities({ filter: { search: query } });
  }

  trackByFn(index: number, item: Branch) {
    return item.id;
  }
  compareById(value: Branch, option: Branch) {
    return value && option && value.id == option.id;
  }
}
