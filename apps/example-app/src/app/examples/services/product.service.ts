import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';

import { Product, ProductDetail } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private httpClient: HttpClient) {}

  getProducts(options?: {
    search?: string | undefined;
    sortColumn?: keyof Product | string | undefined;
    sortAscending?: boolean | undefined;
    skip?: number | undefined;
    take?: number | undefined;
  }) {
    return this.httpClient
      .get<{
        resultList: Product[];
        total: number;
      }>('/products', {
        params: { ...options, search: options?.search ?? '' },
      })
      .pipe(delay(500));
  }

  getProductDetail(id: string) {
    return this.httpClient
      .get<ProductDetail>('/products/' + id)
      .pipe(delay(500));
  }
}
