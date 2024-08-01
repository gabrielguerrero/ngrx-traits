import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { withCalls, withRouteParams } from '@ngrx-traits/signals';
import { signalStore, withHooks } from '@ngrx/signals';

import { ProductService } from '../../services/product.service';

const ProductDetailStore = signalStore(
  withRouteParams(({ id }) => ({ id })),
  withCalls(() => ({
    loadProductDetail: (id: string) =>
      inject(ProductService).getProductDetail(id),
  })),
  withHooks(({ loadProductDetail, id }) => ({
    onInit: () => {
      loadProductDetail(id());
    },
  })),
);
@Component({
  selector: 'route-product-detail',
  styles: [
    `
      mat-spinner {
        margin: 10px auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatCardModule, MatProgressSpinnerModule, CurrencyPipe],
  providers: [ProductDetailStore],
  template: `
    @if (store.isLoadProductDetailLoaded()) {
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{
            store.loadProductDetailResult()?.name
          }}</mat-card-title>
          <mat-card-subtitle
            >Price: £{{ store.loadProductDetailResult()?.price | currency }}
            Released:
            {{
              store.loadProductDetailResult()?.releaseDate
            }}</mat-card-subtitle
          >
        </mat-card-header>
        <img
          mat-card-image
          src="/{{ store.loadProductDetailResult()?.image }}"
        />
        <mat-card-content>
          <p>{{ store.loadProductDetailResult()?.description }}</p>
        </mat-card-content>
      </mat-card>
    } @else if (store.isLoadProductDetailLoading()) {
      <mat-spinner />
    }
  `,
})
export class RouteProductDetailComponent {
  store = inject(ProductDetailStore);
}
