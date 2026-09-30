import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@freelance-platform/http';
import {
  CreateTaskRequest,
  FindTasksQuery,
  TaskListResponse,
  TaskResponse,
} from '@freelance-platform/shared-types';

type TaskListParams = Record<string, string>;

function toTaskListParams(query: FindTasksQuery): TaskListParams {
  const params: TaskListParams = {};

  if (query.categoryId !== undefined) {
    params['categoryId'] = query.categoryId;
  }

  if (query.status !== undefined) {
    params['status'] = query.status;
  }

  if (query.budgetMin !== undefined) {
    params['budgetMin'] = String(query.budgetMin);
  }

  if (query.budgetMax !== undefined) {
    params['budgetMax'] = String(query.budgetMax);
  }

  if (query.sort !== undefined) {
    params['sort'] = query.sort;
  }

  if (query.page !== undefined) {
    params['page'] = String(query.page);
  }

  if (query.limit !== undefined) {
    params['limit'] = String(query.limit);
  }

  return params;
}

@Injectable({ providedIn: 'root' })
export class TaskApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  findAll(query?: FindTasksQuery): Observable<TaskListResponse> {
    const url = `${this.apiBaseUrl}/tasks`;

    if (!query) {
      return this.http.get<TaskListResponse>(url);
    }

    return this.http.get<TaskListResponse>(url, {
      params: toTaskListParams(query),
    });
  }

  findOne(id: string): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.apiBaseUrl}/tasks/${id}`);
  }

  create(body: CreateTaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${this.apiBaseUrl}/tasks`, body);
  }
}
