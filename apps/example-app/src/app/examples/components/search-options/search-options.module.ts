import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchOptionsComponent } from './search-options.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [SearchOptionsComponent],
  exports: [SearchOptionsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class SearchOptionsModule {}
