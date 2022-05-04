import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private httpClient: HttpClient) {}
  checkout(...order: { productId: string; quantity: number }[]) {
    return this.httpClient.post<string>('/checkout', order).pipe(delay(500));
  }
}
