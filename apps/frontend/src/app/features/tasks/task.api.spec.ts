import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TaskApi } from '@freelance-platform/client-api';
import { API_BASE_URL } from '@freelance-platform/http';
import {
  createMockTaskListResponse,
  createMockTaskResponse,
  MOCK_TASK_CATEGORY_ID,
} from '@freelance-platform/shared-mock';
import {
  CreateTaskRequest,
  TaskExecutionType,
  TaskListResponse,
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
    categoryId: MOCK_TASK_CATEGORY_ID,
  };

  const response: TaskResponse = createMockTaskResponse({
    ...body,
    budgetMin: 10000,
    budgetMax: 20000,
  });

  const listResponse: TaskListResponse = createMockTaskListResponse({
    items: [response],
  });

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

  it('should request the task list', () => {
    let result: TaskListResponse | null = null;

    api.findAll().subscribe((taskList) => {
      result = taskList;
    });

    const request = http.expectOne('/api/tasks');

    expect(request.request.method).toBe('GET');

    request.flush(listResponse);

    expect(result).toEqual(listResponse);
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
