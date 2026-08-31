import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  debounce,
  form,
  FormField,
  min,
  validate,
} from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { Product, ProductDetail } from '@example-api/shared/models';

import { GenreMultiSelect } from '../../components/genre-multi-select/genre-multi-select';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { ConsolePickerComponent } from './console-picker.component';
import { ProductEditPanelComponent } from './product-edit-panel.component';
import { ProductLinkStore } from './product-link.store';

/**
 * withLink showcase:
 * - the filter is a signal form over linkProductEntitiesFilter(), gated with
 *   updateStoreWhen so only valid filters run (min price <= max price)
 * - the genre and console pickers are reusable FormValueControls, bound to
 *   fields of that same form with [formField]
 * - clicking a row loads its detail (withCalls + callWith) and opens an edit
 *   panel whose form is a link over that detail, saved on demand
 */
@Component({
  selector: 'product-link-page',
  template: `
    <a mat-raised-button routerLink="/signals" class="mb-4">Back to Examples</a>

    <div class="flex items-start gap-4">
      <div class="flex-[2]">
        <mat-card>
          <mat-card-header class="flex items-center">
            <mat-card-title>Products</mat-card-title>
            <mat-card-subtitle>
              Filter form and edit panel connected with withLink
            </mat-card-subtitle>
            <button
              mat-raised-button
              color="primary"
              class="ml-auto"
              (click)="addProduct()"
            >
              Add Product
            </button>
          </mat-card-header>
          <mat-card-content>
            <form class="mb-2 flex gap-2">
              <mat-form-field subscriptSizing="dynamic">
                <mat-label>Search</mat-label>
                <input matInput [formField]="filterForm.search" />
              </mat-form-field>
              <mat-form-field subscriptSizing="dynamic">
                <mat-label>Min price</mat-label>
                <input
                  matInput
                  type="number"
                  [formField]="filterForm.price.min"
                />
              </mat-form-field>
              <mat-form-field subscriptSizing="dynamic">
                <mat-label>Max price</mat-label>
                <input
                  matInput
                  type="number"
                  [formField]="filterForm.price.max"
                />
              </mat-form-field>
              <genre-multi-select [formField]="filterForm.genres" />
            </form>
            @if (filterForm.price().invalid()) {
              <div class="mb-2 [color:var(--mat-sys-error)]">
                Min price must be 0 or ≤ max price
              </div>
            }
            <console-picker
              class="mb-2 block"
              [formField]="filterForm.consoles"
            />

            @if (store.isProductEntitiesLoading()) {
              <mat-spinner />
            } @else {
              <product-list
                [list]="store.productEntitiesCurrentPage().entities"
                [selectedProduct]="store.productEntitySelected()"
                (selectProduct)="selectProduct($event)"
              />
              <mat-paginator
                [pageSizeOptions]="[5, 10, 25, 100]"
                [length]="store.productEntitiesCurrentPage.total()"
                [pageSize]="store.productEntitiesCurrentPage().pageSize"
                [pageIndex]="store.productEntitiesCurrentPage().pageIndex"
                (page)="store.loadProductEntitiesPage($event)"
              />
            }
          </mat-card-content>
        </mat-card>
      </div>
      @if (editingId(); as id) {
        <div class="sticky top-4 flex-1">
          <product-edit-panel
            [id]="id === newProduct ? '' : id"
            (saved)="onSaved($event)"
            (closed)="closeEdit()"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatButton,
    RouterLink,
    FormField,
    ConsolePickerComponent,
    ProductEditPanelComponent,
    ProductListComponent,
    GenreMultiSelect,
  ],
  providers: [ProductLinkStore],
})
export class ProductLinkPageComponent {
  protected store = inject(ProductLinkStore);

  protected filterForm = form(
    this.store.linkProductEntitiesFilter({
      // annotated because filterForm is declared below
      updateStoreWhen: (): boolean => this.filterForm().valid(),
    }),
    (path) => {
      debounce(path.search, 300);
      min(path.price.min, 0);
      validate(path.price, ({ value }) =>
        value().min > value().max
          ? { kind: 'range', message: 'Min price must be ≤ max price' }
          : undefined,
      );
    },
  );

  // marks the panel as editing a new product; a real id edits that product,
  // undefined closes the panel. An empty string would be falsy in the
  // template, hence the sentinel
  protected readonly newProduct = 'product-new';
  protected editingId = signal<string | undefined>(undefined);

  // the whole filter as a signal form; invalid values (min > max) stay in the
  // link's buffer and are applied the moment the form becomes valid
  protected selectProduct(product: Product) {
    const wasSelected = this.store.productEntitySelected()?.id === product.id;
    this.store.toggleSelectProductEntity({ id: product.id });
    this.editingId.set(wasSelected ? undefined : product.id);
  }

  protected addProduct() {
    this.store.deselectProductEntity();
    this.editingId.set(this.newProduct);
  }

  protected closeEdit() {
    this.store.deselectProductEntity();
    this.editingId.set(undefined);
  }

  // what the panel saved: the row is added or updated, and a product that was
  // just created becomes the selected one, so the panel keeps editing it
  protected onSaved(product: ProductDetail) {
    this.store.upsertProduct(product);
    if (this.editingId() === this.newProduct) {
      this.editingId.set(product.id);
      this.store.selectProductEntity({ id: product.id });
    }
  }
}
