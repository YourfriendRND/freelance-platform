import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@freelance-platform/http';
import { TaskCategoryResponse } from '@freelance-platform/shared-types';

@Injectable({ providedIn: 'root' })
export class TaskCategoryApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  findAll(): Observable<TaskCategoryResponse[]> {
    return this.http.get<TaskCategoryResponse[]>(
      `${this.apiBaseUrl}/task-categories`,
    );
  }
}
