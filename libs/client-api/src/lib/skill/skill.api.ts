import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@freelance-platform/http';
import { UserSkill } from '@freelance-platform/shared-types';

@Injectable({ providedIn: 'root' })
export class SkillApi {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  findSuggestions(query: string): Observable<UserSkill[]> {
    return this.http.get<UserSkill[]>(`${this.apiBaseUrl}/skills`, {
      params: { query },
    });
  }
}
