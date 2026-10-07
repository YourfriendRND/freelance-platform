import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TaskApplicationApi } from '@freelance-platform/client-api';
import { API_BASE_URL } from '@freelance-platform/http';
import {
  createMockTaskApplicationResponse,
  MOCK_TASK_ID,
} from '@freelance-platform/shared-mock';
import {
  CreateTaskApplicationRequest,
  TaskApplicationListResponse,
  TaskApplicationResponse,
} from '@freelance-platform/shared-types';

describe('TaskApplicationApi testing', () => {
  let api: TaskApplicationApi;
  let http: HttpTestingController;

  const application: TaskApplicationResponse = createMockTaskApplicationResponse();
  const list: TaskApplicationListResponse = { items: [application] };

  const body: CreateTaskApplicationRequest = {
    taskId: MOCK_TASK_ID,
    message: application.message,
    proposedPrice: 2500,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskApplicationApi,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });

    api = TestBed.inject(TaskApplicationApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should request the current user applications', () => {
    let result: TaskApplicationListResponse | null = null;

    api.findAll().subscribe((response) => {
      result = response;
    });

    const request = http.expectOne('/api/task-applications');

    expect(request.request.method).toBe('GET');

    request.flush(list);

    expect(result).toEqual(list);
  });

  it('should request one application', () => {
    let result: TaskApplicationResponse | null = null;

    api.findOne(application.id).subscribe((response) => {
      result = response;
    });

    const request = http.expectOne(`/api/task-applications/${application.id}`);

    expect(request.request.method).toBe('GET');

    request.flush(application);

    expect(result).toEqual(application);
  });

  it('should create an application', () => {
    let result: TaskApplicationResponse | null = null;

    api.create(body).subscribe((response) => {
      result = response;
    });

    const request = http.expectOne('/api/task-applications');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);

    request.flush(application);

    expect(result).toEqual(application);
  });
});
