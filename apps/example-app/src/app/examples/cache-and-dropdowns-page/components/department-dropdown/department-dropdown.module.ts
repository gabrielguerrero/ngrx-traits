import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentDropdownComponent } from './department-dropdown.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { SearchOptionsModule } from '../../../components/search-options';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

@NgModule({
  declarations: [DepartmentDropdownComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    SearchOptionsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  exports: [DepartmentDropdownComponent],
})
export class DepartmentDropdownModule {}
