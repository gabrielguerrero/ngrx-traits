import { Routes } from '@angular/router';

import { ExamplesComponent } from './examples/examples.component';

export const routes: Routes = [
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
          import('./examples/signals/signal-examples.component').then(
            (m) => m.SignalExamplesComponent,
          ),
      },
      {
        path: 'product-list-paginated',
        loadComponent: () =>
          import(
            './examples/signals/product-list-paginated-page/signal-product-list-paginated-page-container.component'
          ).then((m) => m.SignalProductListPaginatedPageContainerComponent),
      },
      {
        path: 'order-table',
        loadComponent: () =>
          import('./examples/signals/order-list/order-table.component').then(
            (m) => m.OrderTableComponent,
          ),
      },
      {
        path: 'order-list',
        loadComponent: () =>
          import('./examples/signals/order-list/order-list.component').then(
            (m) => m.OrderListComponent,
          ),
      },
      {
        path: 'product-list-paginated/:id',
        loadComponent: () =>
          import(
            './examples/signals/product-list-paginated-page/route-product-detail.component'
          ).then((m) => m.RouteProductDetailComponent),
      },
      {
        path: 'product-list-ssr',
        loadComponent: () =>
          import(
            './examples/signals/product-list-ssr-page/product-list-ssr-page.component'
          ).then((m) => m.ProductListSSRPageComponent),
      },
      {
        path: 'infinite-scroll-dropdown',
        loadComponent: () =>
          import(
            './examples/signals/infinete-scroll-page/infinite-scroll-page.component'
          ).then((m) => m.InfiniteScrollPageComponent),
      },
      {
        path: 'infinite-scroll-list',
        loadComponent: () =>
          import(
            './examples/signals/infinete-scroll-page/products-branch-list.component'
          ).then((m) => m.ProductsBranchListComponent),
      },
      {
        path: 'products-shop',
        loadChildren: () =>
          import(
            './examples/signals/product-shop-page/product-shop-page.routes'
          ).then((m) => m.routes),
      },
    ],
  },
  {
    path: 'ngrx',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./examples/ngrx/ngrx-examples.component').then(
            (m) => m.NgrxExamplesComponent,
          ),
      },
      {
        path: 'product-list',
        loadComponent: () =>
          import(
            './examples/ngrx/product-list-page/product-list-page-container.component'
          ).then((m) => m.ProductListPageContainerComponent),
      },
      {
        path: 'product-list-paginated',
        loadComponent: () =>
          import(
            './examples/ngrx/product-list-paginated-page/product-list-paginated-page-container.component'
          ).then((m) => m.ProductListPaginatedPageContainerComponent),
      },
      {
        path: 'product-picker',
        loadComponent: () =>
          import(
            './examples/ngrx/product-picker-page/product-picker-page-container.component'
          ).then((m) => m.ProductPickerPageContainerComponent),
      },
      {
        path: 'product-shop',
        loadChildren: () =>
          import(
            './examples/ngrx/product-shop-page/product-shop-page.routes'
          ).then((m) => m.routes),
      },
      {
        path: 'cache-and-dropdowns',
        loadComponent: () =>
          import(
            './examples/ngrx/cache-and-dropdowns-page/cache-and-dropdowns-page.component'
          ).then((m) => m.CacheAndDropdownsPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: '/not-found' },
];
