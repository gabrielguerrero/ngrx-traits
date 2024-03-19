import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CacheAndDropdownsPageComponent } from './cache-and-dropdowns-page.component';

import { ReactiveFormsModule } from '@angular/forms';
import { CacheAndDropdownsRoutingModule } from './cache-and-dropdowns-routing.module';
import { MatCardModule as MatCardModule } from '@angular/material/card';
import { CacheModule } from '@ngrx-traits/core';

@NgModule({
  imports: [
    CommonModule,
    CacheAndDropdownsRoutingModule,
    ReactiveFormsModule,
    MatCardModule,
    CacheModule,
    CacheAndDropdownsPageComponent,
  ],
})
export class CacheAndDropdownsPageModule {}
