import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TaskCategoryApi } from '@freelance-platform/client-api';
import { API_BASE_URL } from '@freelance-platform/http';
import { PopularTaskCategory } from '@freelance-platform/shared-types';

describe('TaskCategoryApi testing', () => {
  let api: TaskCategoryApi;
  let http: HttpTestingController;

  const popular: PopularTaskCategory[] = [
    {
      id: '9bce14fc-45b4-44ad-99c3-01fbeccf4e7f',
      title: 'Программирование и IT',
      description: 'Разработка сайтов и приложений',
      taskCount: 5,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskCategoryApi,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });

    api = TestBed.inject(TaskCategoryApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should request popular categories', () => {
    let result: PopularTaskCategory[] | null = null;

    api.findPopular().subscribe((categories) => {
      result = categories;
    });

    const request = http.expectOne('/api/task-categories/popular');

    expect(request.request.method).toBe('GET');
    request.flush(popular);

    expect(result).toEqual(popular);
  });
});