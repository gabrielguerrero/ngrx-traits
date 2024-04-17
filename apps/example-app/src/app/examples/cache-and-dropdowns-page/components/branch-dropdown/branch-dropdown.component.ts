import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { input } from '@angular/core';
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
import { createSelector, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SearchOptionsComponent } from '../../../components/search-options/search-options.component';
import { Branch } from '../../../models';
import { BranchLocalTraits } from './store.local-traits';

@Component({
  selector: 'branch-dropdown',
  template: `
    @if (data$ | async; as data) {
      <mat-form-field class="container" floatLabel="always">
        <mat-label>Branch</mat-label>
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
    BranchLocalTraits,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: BranchDropdownComponent,
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
export class BranchDropdownComponent
  implements OnInit, ControlValueAccessor, OnDestroy
{
  control = new UntypedFormControl();
  data$ = this.store.select(
    createSelector(
      this.traits.localSelectors.isBranchesLoading,
      this.traits.localSelectors.selectBranchesList,
      (isLoading, stores) => ({ isLoading, stores }),
    ),
  );
  private onTouch: any;
  destroy = new Subject<void>();

  @Input() set value(value: Branch) {
    this.control.setValue(value);
  }
  @Output() valueChanges = this.control.valueChanges as Observable<Branch>;

  constructor(
    private store: Store,
    private traits: BranchLocalTraits,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(this.traits.localActions.loadBranches());
  }

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
      this.traits.localActions.filterBranches({ filters: { search: text } }),
    );
  }
}
