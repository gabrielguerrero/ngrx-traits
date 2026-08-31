import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Console, Product, ProductDetail } from '@example-api/shared/models';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private httpClient: HttpClient) {}

  getProducts(options?: {
    search?: string | undefined;
    sortColumn?: keyof Product | string | undefined;
    sortAscending?: boolean | undefined;
    skip?: number | undefined;
    take?: number | undefined;
    category?: Console;
  }) {
    return this.httpClient
      .get<{
        resultList: Product[];
        total: number;
      }>('/api/products', {
        params: {
          ...options,
          search: options?.search ?? '',
          category: options?.category ?? '',
        },
      })
      .pipe(delay(500));
  }

  createProduct(product: ProductDetail) {
    return this.httpClient
      .post<ProductDetail>('/api/products', product)
      .pipe(delay(500));
  }

  updateProduct(product: ProductDetail) {
    return this.httpClient
      .put<ProductDetail>('/api/products/' + product.id, product)
      .pipe(delay(500));
  }

  getProductDetail(id: string) {
    return this.httpClient
      .get<ProductDetail>('/api/products/' + id)
      .pipe(delay(500));
  }
}
