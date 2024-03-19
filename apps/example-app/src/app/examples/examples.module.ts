import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamplesComponent } from './examples.component';
import { ExamplesRoutingModule } from './examples-routing.module';
import { MatCardModule as MatCardModule } from '@angular/material/card';
import { MatListModule as MatListModule } from '@angular/material/list';

@NgModule({
  imports: [
    CommonModule,
    ExamplesRoutingModule,
    MatCardModule,
    MatListModule,
    ExamplesComponent,
  ],
})
export class ExamplesModule {}
