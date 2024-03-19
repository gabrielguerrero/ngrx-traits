import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductFilter } from '../../models';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { JsonPipe } from '@angular/common';

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
  imports: [FormsModule, MatFormFieldModule, MatInputModule, JsonPipe],
})
export class ProductSearchFormComponent {
  searchProduct = model<ProductFilter>();
}
