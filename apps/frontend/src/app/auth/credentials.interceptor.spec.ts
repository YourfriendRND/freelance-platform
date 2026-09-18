import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { credentialsInterceptor } from '@freelance-platform/http';

describe('credentialsInterceptor testing', () => {
  let httpClient: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should send credentials and disable cache', () => {
    httpClient.get('/api/tasks').subscribe();

    const request = http.expectOne('/api/tasks');

    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('Cache-Control')).toBe('no-cache');
    expect(request.request.headers.get('Pragma')).toBe('no-cache');

    request.flush([]);
  });
});
