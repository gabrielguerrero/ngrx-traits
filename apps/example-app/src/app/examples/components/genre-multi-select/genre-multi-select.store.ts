import { inject } from '@angular/core';
import { Genre } from '@example-api/shared/models';
import { signalStore, type } from '@ngrx/signals';
import { entityConfig, withEntities } from '@ngrx/signals/entities';
import { map } from 'rxjs/operators';

import {
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesLocalFilter,
  withEntitiesMultiSelection,
  withEntitiesSingleSelection,
  withLinkEntitiesMultiSelection,
  withLinkEntitiesSingleSelection,
  withLogger,
} from '@ngrx-traits/signals';

import { GenreService } from '../../services/genre.service';

export interface GenreOption {
  id: Genre;
  label: string;
}

const genreEntityConfig = entityConfig({
  entity: type<GenreOption>(),
  collection: 'genre',
});

export const GenreStore = signalStore(
  withEntities(genreEntityConfig),
  withCallStatus(genreEntityConfig, { initialValue: 'loading' }),
  withEntitiesLocalFilter(genreEntityConfig, {
    defaultFilter: { search: '' },
    filterFn: (genre, filter) =>
      !filter?.search ||
      genre.label.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  // both selections live here, so the same store backs the multi select used
  // by the filter and the single select used by the edit form
  withEntitiesMultiSelection(genreEntityConfig, { clearOnFilter: false }),
  withEntitiesSingleSelection(genreEntityConfig, { clearOnFilter: false }),
  withEntitiesLoadingCall(genreEntityConfig, {
    fetchEntities: () =>
      inject(GenreService)
        .getGenres()
        .pipe(map((r) => r.resultList)),
  }),
  withLinkEntitiesMultiSelection(genreEntityConfig),
  withLinkEntitiesSingleSelection(genreEntityConfig),
  withLogger({
    name: 'GenreStore',
    filter: ['genreIdsSelected', 'genreIdSelected'],
  }),
);
