import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import {
  form,
  FormField,
  min,
  required,
  validate,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductDetail } from '@example-api/shared/models';

import { ConsoleSelect } from '../../components/console-select/console-select';
import { GenreSelect } from '../../components/genre-select/genre-select';
import { ProductEditStore } from './product-edit.store';

/**
 * Edits one product, on its own store: the `id` input feeds the store through
 * `setId()`, the store loads that product's detail with `callWith`, and the
 * form is a signal form over `linkProductDetail()` — so valid edits land in
 * the loaded detail while invalid ones stay buffered in the form.
 *
 * An empty id is a new product: nothing is loaded and saving creates it. What
 * the server returns is emitted on `saved`, for the list to upsert.
 */
@Component({
  selector: 'product-edit-panel',
  template: `
    <mat-card>
      <mat-card-header class="flex items-center">
        <mat-card-title>
          {{ store.isNew() ? 'Add Product' : 'Edit Product' }}
        </mat-card-title>
        <mat-card-subtitle>
          {{
            store.isNew()
              ? 'A blank draft, created on save'
              : 'Loaded with the product detail, saved on demand'
          }}
        </mat-card-subtitle>
        <button
          mat-icon-button
          class="ml-auto"
          (click)="closed.emit()"
          aria-label="Close"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content>
        @if (store.isLoadProductDetailLoading()) {
          <div class="flex justify-center p-6">
            <mat-spinner diameter="40" />
          </div>
        } @else {
          <form class="flex flex-col gap-2">
            <mat-form-field>
              <mat-label>Name</mat-label>
              <input matInput [formField]="editForm.name" />
              @if (editForm.name().touched() && editForm.name().invalid()) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field>
              <mat-label>Description</mat-label>
              <textarea
                matInput
                rows="3"
                [formField]="editForm.description"
              ></textarea>
            </mat-form-field>

            <genre-select [formField]="editForm.genre" />
            <console-select [formField]="editForm.console" />

            <mat-form-field>
              <mat-label>Maker</mat-label>
              <input matInput [formField]="editForm.maker" />
              @if (editForm.maker().touched() && editForm.maker().invalid()) {
                <mat-error>Maker is required</mat-error>
              }
            </mat-form-field>

            <div class="flex gap-2">
              <mat-form-field class="flex-1">
                <mat-label>Release year</mat-label>
                <input
                  matInput
                  [formField]="editForm.releaseDate"
                  type="number"
                />
                @if (
                  editForm.releaseDate().touched() &&
                  editForm.releaseDate().invalid()
                ) {
                  <mat-error>
                    {{
                      editForm.releaseDate().value()
                        ? 'Release year must be greater than 0'
                        : 'Release year is required'
                    }}
                  </mat-error>
                }
              </mat-form-field>
              <mat-form-field class="flex-1">
                <mat-label>Price</mat-label>
                <input
                  matInput
                  type="number"
                  step="0.01"
                  [formField]="editForm.price"
                />
                @if (editForm.price().touched() && editForm.price().invalid()) {
                  <mat-error>Price must be 0 or more</mat-error>
                }
              </mat-form-field>
            </div>
          </form>
        }
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button type="button" (click)="closed.emit()">Cancel</button>
        <button
          mat-raised-button
          type="button"
          color="primary"
          [disabled]="
            editForm().invalid() ||
            (!editForm().dirty() && !store.isNew()) ||
            store.isSaveProductLoading()
          "
          (click)="save()"
        >
          @if (store.isSaveProductLoading()) {
            <mat-spinner diameter="20" />
          } @else {
            {{ store.isNew() ? 'Create' : 'Save' }}
          }
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProductEditStore],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormField,
    GenreSelect,
    ConsoleSelect,
  ],
})
export class ProductEditPanelComponent {
  protected store = inject(ProductEditStore);
  /** Product to edit, empty for a new one. */
  id = input.required<string>();
  closed = output<void>();
  saved = output<ProductDetail>();

  // setId is a signalMethod, so the store keeps following the input
  private syncId = this.store.setId(this.id);

  // the loaded detail in the store; only valid edits are written to it
  protected data = this.store.linkProductDetail({
    // annotated because editForm is declared below
    updateStoreWhen: (): boolean => this.editForm().valid(),
  });
  protected editForm = form(this.data, (path) => {
    required(path.name);
    required(path.maker);
    min(path.price, 0);
    required(path.releaseDate);
    // the year is a string on the model, so min() does not apply to it
    validate(path.releaseDate, ({ value }) => {
      const year = Number(value());
      return Number.isFinite(year) && year > 0
        ? undefined
        : {
            kind: 'releaseDate',
            message: 'Release year must be a number greater than 0',
          };
    });
  });

  protected async save() {
    const result = await this.store.saveProduct(this.data());
    if (!result.ok) return;
    // the store put what the server returned into the detail, so this is the
    // saved product — with the id it was given, when it was just created
    this.saved.emit(this.data());
    // reset to the value just saved: same value, so nothing is written back
    // through the link, but the form is no longer dirty and Save disables
    this.editForm().reset(this.data());
  }
}
