import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProductDetail } from '../../models';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { NgIf, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'product-detail',
  template: `
    <ng-container *ngIf="!productLoading; else loading">
      <mat-card *ngIf="product">
        <mat-card-header>
          <mat-card-title>{{ product?.name }}</mat-card-title>
          <mat-card-subtitle
            >Price: £{{ product?.price | currency }} Released:
            {{ product?.releaseDate }}</mat-card-subtitle
          >
        </mat-card-header>
        <img mat-card-image src="/{{ product?.image }}" />
        <mat-card-content>
          <p>{{ product?.description }}</p>
        </mat-card-content>
      </mat-card>
    </ng-container>
    <ng-template #loading>
      <mat-spinner></mat-spinner>
    </ng-template>
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
  imports: [NgIf, MatCardModule, MatProgressSpinnerModule, CurrencyPipe],
})
export class ProductDetailComponent {
  @Input() product: ProductDetail | undefined;
  @Input() productLoading = false;
}
