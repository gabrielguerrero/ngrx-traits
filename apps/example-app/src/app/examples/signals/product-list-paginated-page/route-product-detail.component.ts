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
import { callConfig, withCalls, withRouteParams } from '@ngrx-traits/signals';
import { signalStore, withHooks } from '@ngrx/signals';

import { ProductService } from '../../services/product.service';

const ProductDetailStore = signalStore(
  withRouteParams(({ id }) => ({ id: id as string })),
  withCalls(({ id }) => ({
    loadProductDetail: callConfig({
      call: (id: string) => inject(ProductService).getProductDetail(id),
      callWith: id(),
    }),
  })),
  // This is the same as the above withCalls
  // withHooks(({ loadProductDetail, id }) => ({
  //   onInit: () => {
  //     loadProductDetail(id());
  //   },
  // })),
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
    @if (store.loadProductDetailResult(); as result) {
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ result.name }}</mat-card-title>
          <mat-card-subtitle
            >Price: £{{ result.price | currency }}
            Released:
            {{ result.releaseDate }}</mat-card-subtitle
          >
        </mat-card-header>
        <img mat-card-image src="/{{ result.image }}" />
        <mat-card-content>
          <p>{{ result.description }}</p>
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
