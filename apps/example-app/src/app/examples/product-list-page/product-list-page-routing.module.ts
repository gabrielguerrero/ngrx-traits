import { RouterModule, Routes } from '@angular/router';
import { ProductListPageContainerComponent } from './product-list-page-container.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: ProductListPageContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductListPageRoutingModule {}
