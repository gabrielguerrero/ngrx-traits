import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductDetail } from '@example-api/shared/models';

@Component({
  selector: 'product-detail',

  template: `
    @if (!productLoading()) {
      @if (product()) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ product().name }}</mat-card-title>
            <mat-card-subtitle
              >Price: £{{ product().price | currency }} Released:
              {{ product().releaseDate }}</mat-card-subtitle
            >
          </mat-card-header>
          <img mat-card-image src="{{ product().image }}" />
          <mat-card-content>
            <p>{{ product().description }}</p>
          </mat-card-content>
        </mat-card>
      }
    } @else {
      <mat-spinner></mat-spinner>
    }
  `,
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
})
export class ProductDetailComponent {
  product = input.required<ProductDetail>();
  productLoading = input(false);
}
