import { RouterModule, Routes } from '@angular/router';
import { ProductPickerPageContainerComponent } from './product-picker-page-container.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: ProductPickerPageContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductPickerPageRoutingModule {}
