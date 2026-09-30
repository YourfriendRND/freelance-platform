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
  FindTasksQuery,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  TaskExecutionType,
  TaskListResponse,
  TaskResponse,
  TaskSort,
  TaskStatus,
} from '@freelance-platform/shared-types';
import { TASKS_TEST_BUDGET_MAX, TASKS_TEST_BUDGET_MIN } from './tasks-test.constants';

describe('TaskApi testing', () => {
  let api: TaskApi;
  let http: HttpTestingController;

  const body: CreateTaskRequest = {
    title: 'Разработка адаптивного лендинга',
    description: 'Нужен адаптивный лендинг для запуска продукта',
    status: TaskStatus.Open,
    budgetMin: TASKS_TEST_BUDGET_MIN,
    budgetMax: TASKS_TEST_BUDGET_MAX,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-09-15',
    categoryId: MOCK_TASK_CATEGORY_ID,
  };

  const response: TaskResponse = createMockTaskResponse({
    ...body,
    budgetMin: TASKS_TEST_BUDGET_MIN,
    budgetMax: TASKS_TEST_BUDGET_MAX,
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

  it('should request the task list with page and limit', () => {
    let result: TaskListResponse | null = null;
    const query: FindTasksQuery = {
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
    };

    api.findAll(query).subscribe((taskList) => {
      result = taskList;
    });

    const request = http.expectOne(
      (httpRequest) =>
        httpRequest.method === 'GET' &&
        httpRequest.url === '/api/tasks' &&
        httpRequest.params.get('page') === String(PAGINATION_DEFAULT_PAGE) &&
        httpRequest.params.get('limit') === String(PAGINATION_DEFAULT_LIMIT),
    );

    request.flush(listResponse);

    expect(result).toEqual(listResponse);
  });

  it('should request the task list with filters', () => {
    const query: FindTasksQuery = {
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      categoryId: MOCK_TASK_CATEGORY_ID,
      status: TaskStatus.Open,
      budgetMin: TASKS_TEST_BUDGET_MIN,
      budgetMax: TASKS_TEST_BUDGET_MAX,
    };

    api.findAll(query).subscribe();

    const request = http.expectOne(
      (httpRequest) =>
        httpRequest.method === 'GET' &&
        httpRequest.url === '/api/tasks' &&
        httpRequest.params.get('categoryId') === MOCK_TASK_CATEGORY_ID &&
        httpRequest.params.get('status') === TaskStatus.Open &&
        httpRequest.params.get('budgetMin') === String(TASKS_TEST_BUDGET_MIN) &&
        httpRequest.params.get('budgetMax') === String(TASKS_TEST_BUDGET_MAX),
    );

    request.flush(listResponse);
  });

  it('should request the task list with sort', () => {
    api.findAll({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      sort: TaskSort.BudgetDesc,
    }).subscribe();

    const request = http.expectOne(
      (httpRequest) =>
        httpRequest.method === 'GET' &&
        httpRequest.url === '/api/tasks' &&
        httpRequest.params.get('sort') === TaskSort.BudgetDesc,
    );

    request.flush(listResponse);
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
