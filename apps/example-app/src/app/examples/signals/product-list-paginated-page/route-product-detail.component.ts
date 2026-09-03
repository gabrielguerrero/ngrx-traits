import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { signalStore } from '@ngrx/signals';

import { callConfig, withCalls, withRoute } from '@ngrx-traits/signals';

import { ProductService } from '../../services/product.service';

const ProductDetailStore = signalStore(
  withRoute(({ params }) => ({ id: params.id as string })),
  withCalls(({ id }) => ({
    loadProductDetail: callConfig({
      call: (id: string) => inject(ProductService).getProductDetail(id),
      callWith: id(),
    }),
  })),
  // The code bellow will need to be added if we did not had the callWith: id() in loadProductDetail
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
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
    MatButtonModule,
    RouterLink,
  ],
  providers: [ProductDetailStore],
  template: `
    <a mat-raised-button routerLink="/signals" class="mb-4">Back to Examples</a>
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
        <img
          mat-card-image
          class="h-96 w-full object-cover my-6"
          src="/{{ result.image }}"
        />
        <mat-card-content>
          <p class="line-clamp-3 overflow-hidden">
            {{ result.description }}
          </p>
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
