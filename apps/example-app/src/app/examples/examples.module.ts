import { NgModule } from '@angular/core';

import { ExamplesRoutingModule } from './examples-routing.module';
import { ExamplesComponent } from './examples.component';

@NgModule({
  imports: [ExamplesRoutingModule, ExamplesComponent],
})
export class ExamplesModule {}
