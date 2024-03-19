import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  OnDestroy,
} from '@angular/core';
import { ProductsStore } from '../../../models';
import { ProductsStoreLocalTraits } from './store.local-traits';
import { createSelector, Store } from '@ngrx/store';
import {
  ControlValueAccessor,
  UntypedFormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatOptionModule } from '@angular/material/core';
import { SearchOptionsComponent } from '../../../components/search-options/search-options.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
  selector: 'store-dropdown',
  template: `
    <mat-form-field
      class="container"
      floatLabel="always"
      *ngIf="data$ | async as data"
    >
      <mat-label>Store</mat-label>
      <mat-select
        [formControl]="control"
        [placeholder]="data.isLoading ? 'Loading...' : 'Please Select'"
        [compareWith]="compareById"
        (closed)="search(undefined)"
      >
        <search-options (valueChanges)="search($event)"></search-options>
        <mat-option
          *ngFor="let item of data.stores"
          class="fact-item"
          [value]="item"
        >
          {{ item.name }}
        </mat-option>

        <mat-option disabled *ngIf="data.isLoading">
          <mat-spinner diameter="35"></mat-spinner>
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      .container {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ProductsStoreLocalTraits,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: StoreDropdownComponent,
      multi: true,
    },
  ],
  standalone: true,
  imports: [
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    SearchOptionsComponent,
    NgFor,
    MatOptionModule,
    MatProgressSpinnerModule,
    AsyncPipe,
  ],
})
export class StoreDropdownComponent
  implements OnInit, ControlValueAccessor, OnDestroy
{
  control = new UntypedFormControl();
  data$ = this.store.select(
    createSelector(
      this.traits.localSelectors.isStoresLoading,
      this.traits.localSelectors.selectStoresList,
      (isLoading, stores) => ({ isLoading, stores })
    )
  );
  private onTouch: any;
  destroy = new Subject<void>();

  @Input() set value(value: ProductsStore) {
    this.control.setValue(value);
  }
  @Output() valueChanges = this.control
    .valueChanges as Observable<ProductsStore>;

  constructor(private store: Store, private traits: ProductsStoreLocalTraits) {}

  ngOnInit(): void {
    this.store.dispatch(this.traits.localActions.loadStores());
  }

  writeValue(value: ProductsStore): void {
    this.control.setValue(value);
  }

  registerOnChange(onChange: any): void {
    this.control.valueChanges
      .pipe(takeUntil(this.destroy))
      .subscribe((v) => onChange(v));
  }

  registerOnTouched(onTouch: any): void {
    this.onTouch = onTouch;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  compareById(value: ProductsStore, option: ProductsStore) {
    return value && option && value.id == option.id;
  }
  search(text: string | undefined) {
    this.store.dispatch(
      this.traits.localActions.filterStores({ filters: { search: text } })
    );
  }
}
