import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDropdownComponent } from './store-dropdown.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
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
