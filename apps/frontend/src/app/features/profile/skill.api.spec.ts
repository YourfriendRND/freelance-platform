import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SkillApi } from '@freelance-platform/client-api';
import { API_BASE_URL } from '@freelance-platform/http';
import { UserSkill } from '@freelance-platform/shared-types';

describe('SkillApi testing', () => {
  let api: SkillApi;
  let http: HttpTestingController;

  const skills: UserSkill[] = [
    { id: 'b4252672-a116-41ee-b78c-d694b236db32', name: 'TypeScript' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SkillApi,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });

    api = TestBed.inject(SkillApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should request skill suggestions by the trimmed query', () => {
    let result: UserSkill[] | null = null;

    api.findSuggestions('type').subscribe((response) => {
      result = response;
    });

    const request = http.expectOne('/api/skills?query=type');

    expect(request.request.method).toBe('GET');
    request.flush(skills);

    expect(result).toEqual(skills);
  });
});
