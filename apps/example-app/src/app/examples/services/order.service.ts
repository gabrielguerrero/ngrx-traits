import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';

import { OrderDetail, OrderSummary } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private httpClient: HttpClient) {}
  checkout(...order: { productId: string; quantity: number }[]) {
    return this.httpClient.post<string>('/checkout', order).pipe(delay(500));
  }
  getOrders() {
    return this.httpClient
      .get<{ resultList: OrderSummary[]; total?: number }>('/orders')
      .pipe(delay(500));
  }
  getOrderDetail(orderId: string) {
    return this.httpClient
      .get<OrderDetail>(`/orders/${orderId}`)
      .pipe(delay(2000));
  }
  changeStatus(orderId: string, status: OrderSummary['status']) {
    return this.httpClient
      .put<OrderDetail>(`/orders/${orderId}`, { status })
      .pipe(delay(3000));
  }
  delete(orderId: string) {
    return this.httpClient
      .delete<boolean>(`/orders/${orderId}`)
      .pipe(delay(2000));
  }
}
