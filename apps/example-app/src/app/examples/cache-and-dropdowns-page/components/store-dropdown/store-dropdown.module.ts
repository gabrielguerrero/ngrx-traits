import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDropdownComponent } from './store-dropdown.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SearchOptionsModule } from '../../../components/search-options';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [StoreDropdownComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    SearchOptionsModule,
    ReactiveFormsModule,
  ],
  exports: [StoreDropdownComponent],
})
export class StoreDropdownModule {}
