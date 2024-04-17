import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { Branch, BranchDetail, BranchResponse, Product } from '../models';

@Injectable({ providedIn: 'root' })
export class BranchService {
  constructor(private httpClient: HttpClient) {}

  getBranches(options?: {
    search?: string | undefined;
    sortColumn?: keyof Product | string | undefined;
    sortAscending?: boolean | undefined;
    skip?: number | undefined;
    take?: number | undefined;
  }): Observable<BranchResponse> {
    return this.httpClient
      .get<BranchResponse>('/branches', {
        params: { ...options, search: options?.search ?? '' },
      })
      .pipe(delay(500));
  }
  getBranchDetails(id: number) {
    return this.httpClient
      .get<BranchDetail>('/branches/' + id)
      .pipe(delay(500));
  }

  getBranchDepartments(storeId: number) {
    return this.getBranchDetails(storeId).pipe(
      map((v) => v?.departments || []),
    );
  }
}
