import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Product, ProductFilter } from '../../../models';
import { Sort } from 'ngrx-traits/traits';
import { ProductsLocalTraits } from './products.traits';

@Component({
  selector: 'product-select-dialog',
  template: ` <h2 mat-dialog-title>Install Angular</h2>
    <ng-container *ngIf="data$ | async as data">
      <mat-dialog-content class="mat-typography">
        <mat-spinner *ngIf="data.isLoading; else listProducts"></mat-spinner>
        <ng-template #listProducts>
          <product-search-form
            (searchProduct)="filter($event)"
          ></product-search-form>
          <product-list
            [list]="data.products"
            [selectedId]="data.selectedProduct?.id"
            (selectProduct)="select($event)"
            (sort)="sort($event)"
          ></product-list>
        </ng-template>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button
          mat-raised-button
          type="button"
          [disabled]="!data.selectedProduct"
          [mat-dialog-close]="data.selectedProduct"
        >
          Select
        </button>
      </mat-dialog-actions>
    </ng-container>`,
  styles: [
    `
      mat-spinner {
        margin: 10px auto;
      }
    `,
  ],
  providers: [ProductsLocalTraits],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSelectDialogComponent implements OnInit {
  data$ = combineLatest([
    this.store.select(this.localTraits.selectors.selectAll),
    this.store.select(this.localTraits.selectors.isLoading),
    this.store.select(this.localTraits.selectors.selectEntitySelected),
  ]).pipe(
    map(([products, isLoading, selectedProduct]) => ({
      products,
      isLoading,
      selectedProduct,
    }))
  );

  constructor(private store: Store, private localTraits: ProductsLocalTraits) {}

  ngOnInit() {
    this.store.dispatch(this.localTraits.actions.fetch());
  }

  select(id: string) {
    this.store.dispatch(this.localTraits.actions.select({ id }));
  }

  filter(filters: ProductFilter) {
    this.store.dispatch(this.localTraits.actions.filter({ filters }));
  }
  sort(sort: Sort<Product>) {
    this.store.dispatch(this.localTraits.actions.sort(sort));
  }
}
