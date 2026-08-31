import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Genre, genreLabelMap } from '@example-api/shared/models';

import { GenreStore } from '../genre-multi-select/genre-multi-select.store';
import { SearchOptionsComponent } from '../search-options/search-options.component';

/**
 * Single genre picker, the counterpart of `genre-multi-select`: the same
 * `GenreStore` backs both, this one over its single selection.
 *
 * A `FormValueControl`, so it binds to a signal form field with `[formField]`.
 * The store's selection is the source of truth and `linkGenreIdSelected()`
 * keeps `value` in sync with it both ways.
 */
@Component({
  selector: 'genre-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GenreStore],
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    SearchOptionsComponent,
  ],
  template: `
    <mat-form-field class="w-full">
      <mat-label>Genre</mat-label>
      <mat-select
        [(value)]="idSelected"
        [disabled]="disabled()"
        (closed)="store.filterGenreEntities({ filter: { search: '' } })"
      >
        <mat-select-trigger>
          <!-- the label map while the genres are still loading -->
          {{ store.genreEntitySelected()?.label ?? genreLabels[value()] }}
        </mat-select-trigger>
        <search-options
          (valueChange)="
            store.filterGenreEntities({ filter: { search: $event } })
          "
        />

        @if (store.isGenreEntitiesLoading()) {
          <mat-option disabled>
            <mat-spinner diameter="20" />
          </mat-option>
        } @else {
          @for (genre of store.genreEntities(); track genre.id) {
            <mat-option [value]="genre.id">{{ genre.label }}</mat-option>
          }
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class GenreSelect implements FormValueControl<Genre> {
  store = inject(GenreStore);
  value = model<Genre>('action');
  readonly = input<boolean>(false);
  disabled = input<boolean>(false);

  protected genreLabels = genreLabelMap;

  // the store's selected id, as a writable signal the select binds to. The
  // mapping pair rather than syncWith: the selection is optional and value is
  // not, so a deselect leaves the last genre in place
  protected idSelected = this.store.linkGenreIdSelected({
    readFrom: () => this.value(),
    writeTo: (id) => {
      if (id) this.value.set(id as Genre);
    },
  });
}
