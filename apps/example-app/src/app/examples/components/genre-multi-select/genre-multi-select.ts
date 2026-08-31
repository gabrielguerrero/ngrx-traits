import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
} from '@angular/core';
import { form, FormField, FormValueControl } from '@angular/forms/signals';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Genre } from '@example-api/shared/models';

import { SearchOptionsComponent } from '../search-options/search-options.component';
import { GenreStore } from './genre-multi-select.store';

@Component({
  selector: 'genre-multi-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GenreStore],
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    SearchOptionsComponent,
    FormField,
  ],
  template: `
    <mat-form-field>
      <mat-label>Genres</mat-label>
      <mat-select
        multiple
        [formField]="idsSelectedField"
        (closed)="store.filterGenreEntities({ filter: { search: '' } })"
      >
        <mat-select-trigger>
          @if (store.isAllGenreEntitiesSelected() === 'all') {
            All Selected
          } @else {
            {{ store.genreEntities().map((g) => g.label).join(', ') }}
          }
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
          <mat-checkbox
            class="pl-1"
            [checked]="store.isAllGenreEntitiesSelected() === 'all'"
            [indeterminate]="store.isAllGenreEntitiesSelected() === 'some'"
            (click)="
              $event.stopPropagation(); store.toggleSelectAllGenreEntities()
            "
          >
            {{
              store.isAllGenreEntitiesSelected() === 'all'
                ? 'All'
                : store.genreEntitiesSelected().length
            }}
            Selected
          </mat-checkbox>

          @for (genre of store.genreEntities(); track genre.id) {
            <mat-option [value]="genre.id">
              {{ genre.label }}
            </mat-option>
          }
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class GenreMultiSelect implements FormValueControl<Genre[]> {
  store = inject(GenreStore);
  value = model<Genre[]>([]);
  required = input<boolean>(false);
  readonly = input<boolean>(false);
  disabled = input<boolean>(false);

  protected idsSelectedField = form(
    this.store.linkGenreIdsSelected({ syncWith: this.value }),
    (path) => {},
  );
}
