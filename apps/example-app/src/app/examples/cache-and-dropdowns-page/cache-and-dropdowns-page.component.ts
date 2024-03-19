import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { DepartmentDropdownComponent } from './components/department-dropdown/department-dropdown.component';
import { StoreDropdownComponent } from './components/store-dropdown/store-dropdown.component';
import { MatCardModule } from '@angular/material/card';

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
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    StoreDropdownComponent,
    DepartmentDropdownComponent,
  ],
})
export class CacheAndDropdownsPageComponent {
  form = new UntypedFormGroup({
    store: new UntypedFormControl(),
    department: new UntypedFormControl(),
  });
}
