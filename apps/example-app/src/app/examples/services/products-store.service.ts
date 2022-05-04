import { Injectable } from '@angular/core';
import { ProductsStore, ProductsStoreDetail } from '../models';
import { delay, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProductsStoreService {
  constructor(private httpClient: HttpClient) {}

  getStores() {
    return this.httpClient.get<ProductsStore[]>('/stores/').pipe(delay(500));
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
