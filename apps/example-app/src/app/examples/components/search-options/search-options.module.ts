import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchOptionsComponent } from './search-options.component';

import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [SearchOptionsComponent],
  exports: [SearchOptionsComponent],
  imports: [
    CommonModule,

    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class SearchOptionsModule {}
