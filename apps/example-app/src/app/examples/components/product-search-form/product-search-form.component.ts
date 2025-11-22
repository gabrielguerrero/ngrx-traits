import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProductFilter } from '@example-api/shared/models';

@Component({
  selector: 'product-search-form',
  template: `
    <form>
      <mat-form-field>
        <mat-label>Search</mat-label>
        <input
          type="text"
          matInput
          [ngModel]="searchProduct()?.search"
          name="search"
          (ngModelChange)="searchProduct.set({ search: $event })"
        />
      </mat-form-field>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
})
export class ProductSearchFormComponent {
  searchProduct = model<ProductFilter>();
}
