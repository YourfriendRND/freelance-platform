import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@freelance-platform/http';
import {
  CreateTaskApplicationRequest,
  TaskApplicationListResponse,
  TaskApplicationResponse,
} from '@freelance-platform/shared-types';

@Injectable({ providedIn: 'root' })
export class TaskApplicationApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  findAll(): Observable<TaskApplicationListResponse> {
    return this.http.get<TaskApplicationListResponse>(
      `${this.apiBaseUrl}/task-applications`,
    );
  }

  findOne(id: string): Observable<TaskApplicationResponse> {
    return this.http.get<TaskApplicationResponse>(
      `${this.apiBaseUrl}/task-applications/${id}`,
    );
  }

  create(body: CreateTaskApplicationRequest): Observable<TaskApplicationResponse> {
    return this.http.post<TaskApplicationResponse>(
      `${this.apiBaseUrl}/task-applications`,
      body,
    );
  }
}
