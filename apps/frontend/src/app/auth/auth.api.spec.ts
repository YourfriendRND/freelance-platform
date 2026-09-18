import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthApi } from '@freelance-platform/client-api';
import { API_BASE_URL } from '@freelance-platform/http';
import {
  MOCK_USER_EMAIL,
  mockClientUserResponse,
} from '@freelance-platform/shared-mock';
import {
  CreateUserRequest,
  LoginUserRequest,
  MessageResponse,
  UserResponse,
} from '@freelance-platform/shared-types';

describe('AuthApi testing', () => {
  let api: AuthApi;
  let http: HttpTestingController;

  const user: UserResponse = mockClientUserResponse;

  const joinBody: CreateUserRequest = {
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: MOCK_USER_EMAIL,
    password: 'password1',
  };

  const loginBody: LoginUserRequest = {
    email: MOCK_USER_EMAIL,
    password: 'password1',
  };

  const logoutResponse: MessageResponse = {
    message: 'Вы вышли из системы',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthApi,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });

    api = TestBed.inject(AuthApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should send a join request', () => {
    let result: UserResponse | null = null;

    api.join(joinBody).subscribe((joinedUser) => {
      result = joinedUser;
    });

    const request = http.expectOne('/api/auth/join');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(joinBody);

    request.flush(user);

    expect(result).toEqual(user);
  });

  it('should send a login request', () => {
    let result: UserResponse | null = null;

    api.login(loginBody).subscribe((loggedInUser) => {
      result = loggedInUser;
    });

    const request = http.expectOne('/api/auth/login');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(loginBody);

    request.flush(user);

    expect(result).toEqual(user);
  });

  it('should request the current user', () => {
    let result: UserResponse | null = null;

    api.me().subscribe((currentUser) => {
      result = currentUser;
    });

    const request = http.expectOne('/api/auth/me');

    expect(request.request.method).toBe('GET');

    request.flush(user);

    expect(result).toEqual(user);
  });

  it('should send a refresh request', () => {
    let result: UserResponse | null = null;

    api.refresh().subscribe((refreshedUser) => {
      result = refreshedUser;
    });

    const request = http.expectOne('/api/auth/refresh');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});

    request.flush(user);

    expect(result).toEqual(user);
  });

  it('should send a logout request', () => {
    let result: MessageResponse | null = null;

    api.logout().subscribe((message) => {
      result = message;
    });

    const request = http.expectOne('/api/auth/logout');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});

    request.flush(logoutResponse);

    expect(result).toEqual(logoutResponse);
  });
});
