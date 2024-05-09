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
import { withCalls } from '@ngrx-traits/signals';
import { signalStore } from '@ngrx/signals';

import { ProductService } from '../../../../services/product.service';

const ProductDetailStore = signalStore(
  withCalls(() => ({
    loadProductDetail: (id: string) =>
      inject(ProductService).getProductDetail(id),
  })),
);
@Component({
  selector: 'smart-product-detail',
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
export class SmartProductDetailComponent implements OnInit {
  store = inject(ProductDetailStore);
  productId = input.required<string>();
  ngOnInit() {
    // 👇 loadProductDetail is an rxMethod it can receive a signal reference
    this.store.loadProductDetail(this.productId);
  }
  // other ways

  // loadProductDetail = effect(
  //   () => {
  //     this.store.loadProductDetail(this.productId());
  //   },
  //   { allowSignalWrites: true },
  // );

  // constructor() {
  //   effect(
  //     () => {
  //       this.store.loadProductDetail(this.productId());
  //     },
  //     { allowSignalWrites: true },
  //   );
  // }
}
