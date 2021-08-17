import { RouterModule, Routes } from '@angular/router';
import { ProductShopPageContainerComponent } from './product-shop-page-container.component';
import { NgModule } from '@angular/core';
import { ProductShopTabModule } from './components/product-shop-tab/product-shop-tab.module';
import { ProductBasketTabModule } from './components/product-basket-tab/product-basket-tab.module';
import { ProductShopTabComponent } from './components/product-shop-tab/product-shop-tab.component';
import { ProductBasketTabComponent } from './components/product-basket-tab/product-basket-tab.component';

const routes: Routes = [
  {
    path: '',
    component: ProductShopPageContainerComponent,
    children: [
      { path: '', redirectTo: 'shop' },
      { path: 'shop', component: ProductShopTabComponent },
      {
        path: 'basket',
        component: ProductBasketTabComponent,
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ProductShopTabModule,
    ProductBasketTabModule,
  ],
  exports: [RouterModule],
})
export class ProductShopPageRoutingModule {}
