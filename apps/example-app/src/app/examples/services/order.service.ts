import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class OrderService {
  checkout(...order: { productId: string; quantity: number }[]) {
    return of('123').pipe(delay(1000));
  }
}
