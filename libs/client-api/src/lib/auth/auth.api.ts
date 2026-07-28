import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@freelance-platform/http';
import {
  CreateUserRequest,
  LoginUserRequest,
  UserResponse,
} from '@freelance-platform/shared-types';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  join(body: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiBaseUrl}/auth/join`, body);
  }

  login(body: LoginUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiBaseUrl}/auth/login`, body);
  }
}
