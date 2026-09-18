import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  API_BASE_URL,
  AUTH_SESSION_INVALIDATOR,
  authRefreshInterceptor,
  credentialsInterceptor,
} from '@freelance-platform/http';
import { mockClientUserResponse } from '@freelance-platform/shared-mock';

describe('authRefreshInterceptor testing', () => {
  let httpClient: HttpClient;
  let http: HttpTestingController;
  let invalidateSession: ReturnType<typeof vi.fn>;

  const taskList = { items: [] };

  beforeEach(() => {
    invalidateSession = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([credentialsInterceptor, authRefreshInterceptor]),
        ),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: AUTH_SESSION_INVALIDATOR, useValue: invalidateSession },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  function flushUnauthorized(url: string): void {
    const request = http.expectOne(url);

    request.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );
  }

  it('should refresh the session and retry the original request after 401', () => {
    let result: unknown = null;

    httpClient.get('/api/tasks').subscribe((response) => {
      result = response;
    });

    flushUnauthorized('/api/tasks');

    const refreshRequest = http.expectOne('/api/auth/refresh');

    expect(refreshRequest.request.method).toBe('POST');
    expect(refreshRequest.request.body).toEqual({});
    expect(refreshRequest.request.withCredentials).toBe(true);

    refreshRequest.flush(mockClientUserResponse);

    const retryRequest = http.expectOne('/api/tasks');

    expect(retryRequest.request.method).toBe('GET');

    retryRequest.flush(taskList);

    expect(result).toEqual(taskList);
    expect(invalidateSession).not.toHaveBeenCalled();
  });

  it.each([
    '/api/auth/login',
    '/api/auth/join',
    '/api/auth/refresh',
    '/api/auth/logout',
  ])('should not refresh after 401', (url) => {
    let thrownError: unknown = null;

    httpClient.post(url, {}).subscribe({
      error: (error: unknown) => {
        thrownError = error;
      },
    });

    flushUnauthorized(url);

    http.expectNone((pending) => {
      return pending.url === '/api/auth/refresh' && pending.method === 'POST';
    });

    expect(thrownError).toBeInstanceOf(HttpErrorResponse);
    expect((thrownError as HttpErrorResponse).status).toBe(401);
    expect(invalidateSession).not.toHaveBeenCalled();
  });

  it('should invalidate the session when refresh fails', () => {
    let thrownError: unknown = null;

    httpClient.get('/api/tasks').subscribe({
      error: (error: unknown) => {
        thrownError = error;
      },
    });

    flushUnauthorized('/api/tasks');
    flushUnauthorized('/api/auth/refresh');

    expect(invalidateSession).toHaveBeenCalledTimes(1);
    expect(thrownError).toBeInstanceOf(HttpErrorResponse);
    expect((thrownError as HttpErrorResponse).status).toBe(401);
    http.expectNone('/api/tasks');
  });

  it('should share one refresh between parallel 401 responses', () => {
    let tasksResult: unknown = null;
    let profileResult: unknown = null;
    const profile = { id: 'profile' };

    httpClient.get('/api/tasks').subscribe((response) => {
      tasksResult = response;
    });
    httpClient.get('/api/profile').subscribe((response) => {
      profileResult = response;
    });

    flushUnauthorized('/api/tasks');
    flushUnauthorized('/api/profile');

    const refreshRequest = http.expectOne('/api/auth/refresh');

    expect(refreshRequest.request.method).toBe('POST');

    refreshRequest.flush(mockClientUserResponse);

    http.expectOne('/api/tasks').flush(taskList);
    http.expectOne('/api/profile').flush(profile);

    expect(tasksResult).toEqual(taskList);
    expect(profileResult).toEqual(profile);
    expect(invalidateSession).not.toHaveBeenCalled();
  });

  it('should not refresh after a 403 response', () => {
    let thrownError: unknown = null;

    httpClient.get('/api/tasks').subscribe({
      error: (error: unknown) => {
        thrownError = error;
      },
    });

    http.expectOne('/api/tasks').flush(
      { message: 'Forbidden' },
      { status: 403, statusText: 'Forbidden' },
    );

    http.expectNone('/api/auth/refresh');
    expect(thrownError).toBeInstanceOf(HttpErrorResponse);
    expect((thrownError as HttpErrorResponse).status).toBe(403);
    expect(invalidateSession).not.toHaveBeenCalled();
  });

  it('should not refresh after a network error', () => {
    let thrownError: unknown = null;

    httpClient.get('/api/tasks').subscribe({
      error: (error: unknown) => {
        thrownError = error;
      },
    });

    http.expectOne('/api/tasks').error(new ProgressEvent('error'));

    http.expectNone('/api/auth/refresh');
    expect(thrownError).toBeInstanceOf(HttpErrorResponse);
    expect(invalidateSession).not.toHaveBeenCalled();
  });
});
