import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';

import { GenreResponse } from '@example-api/shared/models';

@Injectable({ providedIn: 'root' })
export class GenreService {
  constructor(private httpClient: HttpClient) {}

  getGenres(options?: {
    search?: string | undefined;
    sortColumn?: string | undefined;
    sortAscending?: boolean | undefined;
    skip?: number | undefined;
    take?: number | undefined;
  }) {
    return this.httpClient
      .get<GenreResponse>('/api/genres', {
        params: {
          ...options,
          search: options?.search ?? '',
        },
      })
      .pipe(delay(500));
  }
}
