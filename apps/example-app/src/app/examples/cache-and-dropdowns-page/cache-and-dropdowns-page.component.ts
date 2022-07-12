import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'ngrx-traits-cache-and-dropdowns-page',
  template: `
    <mat-card>
      <mat-card-content>
        <form [formGroup]="form">
          <store-dropdown
            style="width: 300px"
            formControlName="store"
          ></store-dropdown>

          <div></div>
          <department-dropdown
            style="width: 300px"
            [storeId]="form.get('store')?.value?.id"
            formControlName="department"
          ></department-dropdown>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CacheAndDropdownsPageComponent {
  form = new UntypedFormGroup({
    store: new UntypedFormControl(),
    department: new UntypedFormControl(),
  });
}
