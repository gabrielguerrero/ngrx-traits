import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { ExamplesComponent } from './examples.component';

const routes: Routes = [
  {
    path: '',
    component: ExamplesComponent,
  },
  {
    path: 'product-list',
    loadChildren: () =>
      import('./product-list-page').then((m) => m.ProductListPageModule),
  },
  {
    path: 'product-list-paginated',
    loadChildren: () =>
      import('./product-list-paginated-page').then(
        (m) => m.ProductListPaginatedPageModule
      ),
  },
  {
    path: 'product-picker',
    loadChildren: () =>
      import('./product-picker-page').then((m) => m.ProductPickerPageModule),
  },
  {
    path: 'product-shop',
    loadChildren: () =>
      import('./product-shop-page').then((m) => m.ProductShopPageModule),
  },
  {
    path: 'cache-and-dropdowns',
    loadChildren: () =>
      import('./cache-and-dropdowns-page').then(
        (m) => m.CacheAndDropdownsPageModule
      ),
  },
  { path: '**', redirectTo: '/not-found' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    paramsInheritanceStrategy: 'always'
}),
  ],
  exports: [RouterModule],
})
export class ExamplesRoutingModule {}
