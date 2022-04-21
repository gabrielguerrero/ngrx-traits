import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { createSelector, Store } from '@ngrx/store';
import { ProductsStore } from '../../../models';
import { Observable, Subject } from 'rxjs';
import { DepartmentLocalTraits } from './department.local-traits';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'department-dropdown',
  template: `
    <mat-form-field
      class="container"
      floatLabel="always"
      *ngIf="data$ | async as data"
    >
      <mat-label>Department</mat-label>
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
    DepartmentLocalTraits,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DepartmentDropdownComponent,
      multi: true,
    },
  ],
})
export class DepartmentDropdownComponent
  implements ControlValueAccessor, OnDestroy
{
  /**
   *  Note: For this kind of component I will normally implement ControlValueAccessor
   *  but is not needed for the example so omitted it for simplicity
   */
  control = new FormControl();
  data$ = this.store.select(
    createSelector(
      this.traits.localSelectors.isDepartmentsLoading,
      this.traits.localSelectors.selectDepartmentsList,
      (isLoading, stores) => ({ isLoading, stores })
    )
  );
  private onTouch: any;
  destroy = new Subject();

  @Input() set value(value: ProductsStore) {
    this.writeValue(value);
  }
  @Input() set storeId(storeId: number | undefined) {
    this.control.setValue(null, { emitEvent: false });
    storeId &&
      this.store.dispatch(
        this.traits.localActions.filterDepartments({
          filters: { storeId },
        })
      );
  }

  @Output() valueChanges = this.control
    .valueChanges as Observable<ProductsStore>;

  constructor(private store: Store, private traits: DepartmentLocalTraits) {}

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
    this.destroy.complete();
    this.destroy.unsubscribe();
  }

  compareById(value: ProductsStore, option: ProductsStore) {
    return value && option && value.id == option.id;
  }
  search(text: string | undefined) {
    this.store.dispatch(
      this.traits.localActions.filterDepartments({
        filters: { search: text },
        patch: true,
      })
    );
  }
}
