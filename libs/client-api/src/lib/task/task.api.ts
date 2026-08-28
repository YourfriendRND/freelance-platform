import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@freelance-platform/http';
import { TaskResponse } from '@freelance-platform/shared-types';

@Injectable({ providedIn: 'root' })
export class TaskApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  findAll(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiBaseUrl}/tasks`);
  }
}
