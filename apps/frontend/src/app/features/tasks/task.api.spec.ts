import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TaskApi } from '@freelance-platform/client-api';
import { API_BASE_URL } from '@freelance-platform/http';
import {
  CreateTaskRequest,
  TaskExecutionType,
  TaskResponse,
  TaskStatus,
} from '@freelance-platform/shared-types';

describe('TaskApi testing', () => {
  let api: TaskApi;
  let http: HttpTestingController;

  const body: CreateTaskRequest = {
    title: 'Разработка адаптивного лендинга',
    description: 'Нужен адаптивный лендинг для запуска продукта',
    status: TaskStatus.Open,
    budgetMin: 10000,
    budgetMax: 20000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-09-15',
    categoryId: '7c2a8e14-5d93-4f1b-9b27-2e5d8c01f102',
  };

  const response: TaskResponse = {
    id: '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01',
    ...body,
    customerId: 'b7e14a02-91c3-4d58-8a6f-1c2d3e4f5a61',
    createdAt: '2026-08-20T09:00:00.000Z',
    updatedAt: '2026-08-20T09:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskApi,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });

    api = TestBed.inject(TaskApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should send a create task request', () => {
    let result: TaskResponse | null = null;

    api.create(body).subscribe((task) => {
      result = task;
    });

    const request = http.expectOne('/api/tasks');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);

    request.flush(response);

    expect(result).toEqual(response);
  });
});
