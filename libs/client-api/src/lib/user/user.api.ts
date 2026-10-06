import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@freelance-platform/http';
import { UserResponse } from '@freelance-platform/shared-types';

@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  findOne(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiBaseUrl}/users/${id}`);
  }
}
