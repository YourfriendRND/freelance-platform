import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@freelance-platform/http';
import {
  CreateTaskRequest,
  CustomerTaskStats,
  FindMyTasksQuery,
  FindTasksQuery,
  TaskListResponse,
  TaskResponse,
} from '@freelance-platform/shared-types';
import { toTaskListParams } from './task-list-params';

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

  findMine(query?: FindMyTasksQuery): Observable<TaskListResponse> {
    const url = `${this.apiBaseUrl}/tasks/my`;

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

  getCustomerStats(): Observable<CustomerTaskStats> {
    return this.http.get<CustomerTaskStats>(`${this.apiBaseUrl}/tasks/stats`);
  }

  create(body: CreateTaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${this.apiBaseUrl}/tasks`, body);
  }
}
