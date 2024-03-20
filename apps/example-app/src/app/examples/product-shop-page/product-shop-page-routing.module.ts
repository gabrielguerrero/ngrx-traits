import { RouterModule, Routes } from '@angular/router';
import { ProductShopPageContainerComponent } from './product-shop-page-container.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: ProductShopPageContainerComponent,
    children: [
      { path: '', redirectTo: 'shop', pathMatch: 'prefix' },
      {
        path: 'shop',
        loadComponent: () =>
          import(
            './components/product-shop-tab/product-shop-tab.component'
          ).then((m) => m.ProductShopTabComponent),
      },
      {
        path: 'basket',
        loadComponent: () =>
          import(
            './components/product-basket-tab/product-basket-tab.component'
          ).then((m) => m.ProductBasketTabComponent),
      },
    ],
  },
];

@NgModule({
  imports: [ProductShopPageContainerComponent, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductShopPageRoutingModule {}
