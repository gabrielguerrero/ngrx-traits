import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';

import { Category, Product, ProductDetail } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private httpClient: HttpClient) {}

  getProducts(options?: {
    search?: string | undefined;
    sortColumn?: keyof Product | string | undefined;
    sortAscending?: boolean | undefined;
    skip?: number | undefined;
    take?: number | undefined;
    category?: Category;
  }) {
    return this.httpClient
      .get<{
        resultList: Product[];
        total: number;
      }>('/products', {
        params: {
          ...options,
          search: options?.search ?? '',
          category: options?.category ?? '',
        },
      })
      .pipe(delay(500));
  }

  getProductDetail(id: string) {
    return this.httpClient
      .get<ProductDetail>('/products/' + id)
      .pipe(delay(500));
  }
}
