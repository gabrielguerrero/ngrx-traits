import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private httpClient = inject(HttpClient);

  register(data: { name: string; email: string; password: string }) {
    return this.httpClient
      .post<{ id: string }>('/api/register', data)
      .pipe(delay(500));
  }
}
