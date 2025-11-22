import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  UntypedFormControl,
} from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Branch } from '@example-api/shared/models';
import { createSelector, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SearchOptionsComponent } from '../../../../components/search-options/search-options.component';
import { DepartmentLocalTraits } from './department.local-traits';

@Component({
  selector: 'department-dropdown',
  template: `
    @if (data$ | async; as data) {
      <mat-form-field class="container" floatLabel="always">
        <mat-label>Department</mat-label>
        <mat-select
          [formControl]="control"
          [placeholder]="data.isLoading ? 'Loading...' : 'Please Select'"
          [compareWith]="compareById"
          (closed)="search(undefined)"
        >
          <search-options (valueChanges)="search($event)"></search-options>
          @for (item of data.stores; track item) {
            <mat-option class="fact-item" [value]="item">
              {{ item.name }}
            </mat-option>
          }
          @if (data.isLoading) {
            <mat-option disabled>
              <mat-spinner diameter="35"></mat-spinner>
            </mat-option>
          }
        </mat-select>
      </mat-form-field>
    }
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
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    SearchOptionsComponent,
    MatOptionModule,
    MatProgressSpinnerModule,
    AsyncPipe,
  ],
})
export class DepartmentDropdownComponent
  implements ControlValueAccessor, OnDestroy
{
  /**
   *  Note: For this kind of component I will normally implement ControlValueAccessor
   *  but is not needed for the example so omitted it for simplicity
   */
  control = new UntypedFormControl();
  data$ = this.store.select(
    createSelector({
      isLoading: this.traits.localSelectors.isDepartmentsLoading,
      stores: this.traits.localSelectors.selectDepartmentsList,
    }),
  );

  private onTouch: any;
  destroy = new Subject<void>();

  @Input() set value(value: Branch) {
    this.writeValue(value);
  }
  @Input() set storeId(storeId: number | undefined) {
    this.control.setValue(null, { emitEvent: false });
    storeId &&
      this.store.dispatch(
        this.traits.localActions.filterDepartments({
          filters: { storeId },
        }),
      );
  }

  @Output() valueChanges = this.control.valueChanges as Observable<Branch>;

  constructor(
    private store: Store,
    private traits: DepartmentLocalTraits,
  ) {}

  writeValue(value: Branch): void {
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

  compareById(value: Branch, option: Branch) {
    return value && option && value.id == option.id;
  }

  search(text: string | undefined) {
    this.store.dispatch(
      this.traits.localActions.filterDepartments({
        filters: { search: text },
        patch: true,
      }),
    );
  }
}
