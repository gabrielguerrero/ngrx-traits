import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, map } from 'rxjs/operators';

import {
  Product,
  ProductsStore,
  ProductsStoreDetail,
  ProductsStoreResponse,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ProductsStoreService {
  constructor(private httpClient: HttpClient) {}

  getStores(options?: {
    search?: string | undefined;
    sortColumn?: keyof Product | string | undefined;
    sortAscending?: boolean | undefined;
    skip?: number | undefined;
    take?: number | undefined;
  }) {
    console.log('getStores', options);
    return this.httpClient
      .get<ProductsStoreResponse>('/stores', {
        params: { ...options, search: options?.search ?? '' },
      })
      .pipe(delay(500));
  }
  getStoreDetails(id: number) {
    return this.httpClient
      .get<ProductsStoreDetail>('/stores/' + id)
      .pipe(delay(500));
  }

  getStoreDepartments(storeId: number) {
    return this.getStoreDetails(storeId).pipe(map((v) => v?.departments || []));
  }
}
