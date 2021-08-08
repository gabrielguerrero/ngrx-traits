import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamplesComponent } from './examples.component';
import { ExamplesRoutingModule } from './examples-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [ExamplesComponent],
  imports: [CommonModule, ExamplesRoutingModule, MatCardModule, MatListModule],
})
export class ExamplesModule {}
