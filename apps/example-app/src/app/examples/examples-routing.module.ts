import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'product-list',
    pathMatch: 'full',
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
  { path: '**', redirectTo: '/not-found' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      paramsInheritanceStrategy: 'always',
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class ExamplesRoutingModule {}
