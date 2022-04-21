import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentDropdownComponent } from './department-dropdown.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SearchOptionsModule } from '../../../components/search-options';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
