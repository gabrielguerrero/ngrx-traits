import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

import { BranchDropdownComponent } from './components/branch-dropdown/branch-dropdown.component';
import { DepartmentDropdownComponent } from './components/department-dropdown/department-dropdown.component';

@Component({
  selector: 'ngrx-traits-cache-and-dropdowns-page',
  template: `
    <mat-card>
      <mat-card-content>
        <form [formGroup]="form">
          <branch-dropdown
            style="width: 300px"
            formControlName="branch"
          ></branch-dropdown>

          <div></div>
          <department-dropdown
            style="width: 300px"
            [storeId]="form.get('branch')?.value?.id"
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
    BranchDropdownComponent,
    DepartmentDropdownComponent,
  ],
})
export class CacheAndDropdownsPageComponent {
  form = new UntypedFormGroup({
    branch: new UntypedFormControl(),
    department: new UntypedFormControl(),
  });
}
