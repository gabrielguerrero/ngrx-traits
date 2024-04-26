import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExamplesComponent } from './examples.component';

const routes: Routes = [
  {
    path: '',
    component: ExamplesComponent,
  },
  {
    path: 'signals',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./signals/signal-examples.component').then(
            (m) => m.SignalExamplesComponent,
          ),
      },
      {
        path: 'product-list-paginated',
        loadComponent: () =>
          import(
            './signals/product-list-paginated-page/signal-product-list-paginated-page-container.component'
          ).then((m) => m.SignalProductListPaginatedPageContainerComponent),
      },
      {
        path: 'infinite-scroll-dropdown',
        loadComponent: () =>
          import(
            './signals/infinete-scroll-page/infinite-scroll-page.component'
          ).then((m) => m.InfiniteScrollPageComponent),
      },
      {
        path: 'infinite-scroll-list',
        loadComponent: () =>
          import(
            './signals/infinete-scroll-page/products-branch-list.component'
          ).then((m) => m.ProductsBranchListComponent),
      },
    ],
  },
  {
    path: 'product-list',
    loadComponent: () =>
      import('./product-list-page/product-list-page-container.component').then(
        (m) => m.ProductListPageContainerComponent,
      ),
  },
  {
    path: 'product-list-paginated',
    loadComponent: () =>
      import(
        './product-list-paginated-page/product-list-paginated-page-container.component'
      ).then((m) => m.ProductListPaginatedPageContainerComponent),
  },
  {
    path: 'product-picker',
    loadComponent: () =>
      import(
        './product-picker-page/product-picker-page-container.component'
      ).then((m) => m.ProductPickerPageContainerComponent),
  },
  {
    path: 'product-shop',
    loadChildren: () =>
      import('./product-shop-page/product-shop-page-routing.module').then(
        (m) => m.ProductShopPageRoutingModule,
      ),
  },
  {
    path: 'cache-and-dropdowns',
    loadComponent: () =>
      import(
        './cache-and-dropdowns-page/cache-and-dropdowns-page.component'
      ).then((m) => m.CacheAndDropdownsPageComponent),
  },
  { path: '**', redirectTo: '/not-found' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      paramsInheritanceStrategy: 'always',
    }),
  ],
  exports: [RouterModule],
})
export class ExamplesRoutingModule {}
