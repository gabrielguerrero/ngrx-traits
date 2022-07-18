import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
} from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProductFilter } from '../../models';

@Component({
  selector: 'product-search-form',
  template: `
    <form [formGroup]="searchForm">
      <mat-form-field>
        <mat-label>Search</mat-label>
        <input type="text" matInput formControlName="search" />
      </mat-form-field>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSearchFormComponent {
  searchForm = this.fb.group({
    search: [],
  });
  @Input() set value(value: ProductFilter | undefined) {
    value && this.searchForm.patchValue(value, { emitEvent: false });
  }
  @Output() searchProduct = this.searchForm
    .valueChanges as Observable<ProductFilter>;

  constructor(private fb: UntypedFormBuilder) {}
}
