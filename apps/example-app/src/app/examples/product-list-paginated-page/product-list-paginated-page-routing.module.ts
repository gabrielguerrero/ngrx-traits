import { RouterModule, Routes } from '@angular/router';
import { ProductListPaginatedPageContainerComponent } from './product-list-paginated-page-container.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: ProductListPaginatedPageContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductListPaginatedPageRoutingModule {}
