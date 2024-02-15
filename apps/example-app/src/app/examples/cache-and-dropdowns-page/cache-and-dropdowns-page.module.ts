import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CacheAndDropdownsPageComponent } from './cache-and-dropdowns-page.component';
import { DepartmentDropdownModule } from './components/department-dropdown/department-dropdown.module';
import { StoreDropdownModule } from './components/store-dropdown/store-dropdown.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CacheAndDropdownsRoutingModule } from './cache-and-dropdowns-routing.module';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { CacheModule } from '@ngrx-traits/core';

@NgModule({
  declarations: [CacheAndDropdownsPageComponent],
  imports: [
    CommonModule,
    CacheAndDropdownsRoutingModule,
    DepartmentDropdownModule,
    StoreDropdownModule,
    ReactiveFormsModule,
    MatCardModule,
    CacheModule,
  ],
})
export class CacheAndDropdownsPageModule {}
