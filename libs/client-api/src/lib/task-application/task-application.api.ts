import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@freelance-platform/http';
import {
  CreateTaskApplicationRequest,
  TaskApplicationListResponse,
  TaskApplicationResponse,
  TaskApplicationStatsResponse,
  UpdateTaskApplicationRequest,
} from '@freelance-platform/shared-types';

@Injectable({ providedIn: 'root' })
export class TaskApplicationApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  findAll(taskId?: string): Observable<TaskApplicationListResponse> {
    const url = `${this.apiBaseUrl}/task-applications`;

    if (!taskId) {
      return this.http.get<TaskApplicationListResponse>(url);
    }

    return this.http.get<TaskApplicationListResponse>(url, {
      params: { taskId },
    });
  }

  update(
    id: string,
    body: UpdateTaskApplicationRequest,
  ): Observable<TaskApplicationResponse> {
    return this.http.patch<TaskApplicationResponse>(
      `${this.apiBaseUrl}/task-applications/${id}`,
      body,
    );
  }

  getStats(): Observable<TaskApplicationStatsResponse> {
    return this.http.get<TaskApplicationStatsResponse>(
      `${this.apiBaseUrl}/task-applications/stats`,
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
