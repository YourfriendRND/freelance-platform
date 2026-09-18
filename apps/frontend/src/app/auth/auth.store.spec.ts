import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { AuthApi } from '@freelance-platform/client-api';
import { AuthStore } from '@freelance-platform/client-state';
import {
  createMockUserResponse,
  MOCK_USER_EMAIL,
  mockClientUserResponse,
} from '@freelance-platform/shared-mock';
import { LoginUserRequest, UserResponse } from '@freelance-platform/shared-types';

describe('AuthStore testing', () => {
  let store: InstanceType<typeof AuthStore>;
  let authApi: {
    me: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  const user: UserResponse = mockClientUserResponse;

  const loginBody: LoginUserRequest = {
    email: MOCK_USER_EMAIL,
    password: 'password1',
  };

  beforeEach(() => {
    authApi = { me: vi.fn(), login: vi.fn(), logout: vi.fn() };

    TestBed.configureTestingModule({
      providers: [AuthStore, { provide: AuthApi, useValue: authApi }],
    });

    store = TestBed.inject(AuthStore);
  });

  it('should resolve a session from /auth/me', () => {
    authApi.me.mockReturnValue(of(user));

    let isAuthenticated = false;
    store.ensureSession().subscribe((result) => {
      isAuthenticated = result;
    });

    expect(isAuthenticated).toBe(true);
    expect(store.user()).toEqual(user);
    expect(store.isSessionResolved()).toBe(true);
  });

  it('should treat 401 as a guest session', () => {
    authApi.me.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401 })),
    );

    let isAuthenticated = true;
    store.ensureSession().subscribe((result) => {
      isAuthenticated = result;
    });

    expect(isAuthenticated).toBe(false);
    expect(store.user()).toBeNull();
    expect(store.isSessionResolved()).toBe(true);
    expect(authApi.me).toHaveBeenCalledTimes(1);
  });

  it('should call /auth/me again after the previous session check completed', () => {
    authApi.me.mockReturnValue(of(user));

    store.ensureSession().subscribe();
    store.ensureSession().subscribe();

    expect(authApi.me).toHaveBeenCalledTimes(2);
  });

  it('should replace stored user with the latest /auth/me response', () => {
    const updatedUser: UserResponse = createMockUserResponse({
      firstName: 'Пётр',
    });

    authApi.me
      .mockReturnValueOnce(of(user))
      .mockReturnValueOnce(of(updatedUser));

    store.ensureSession().subscribe();
    store.ensureSession().subscribe();

    expect(store.user()).toEqual(updatedUser);
  });

  it('should clear the user when a later /auth/me returns 401', () => {
    authApi.me.mockReturnValueOnce(of(user));

    store.ensureSession().subscribe();

    expect(store.user()).toEqual(user);

    authApi.me.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401 })),
    );

    store.ensureSession().subscribe();

    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('should share a single in-flight /auth/me request', () => {
    const profile = new Subject<UserResponse>();
    authApi.me.mockReturnValue(profile.asObservable());

    store.ensureSession().subscribe();
    store.ensureSession().subscribe();

    expect(authApi.me).toHaveBeenCalledTimes(1);

    profile.next(user);
    profile.complete();

    expect(store.user()).toEqual(user);
  });

  it('should store the user after a successful login', () => {
    authApi.login.mockReturnValue(of(user));

    let result: UserResponse | null = null;
    store.login(loginBody).subscribe((loggedInUser) => {
      result = loggedInUser;
    });

    expect(authApi.login).toHaveBeenCalledWith(loginBody);
    expect(result).toEqual(user);
    expect(store.user()).toEqual(user);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.isSessionResolved()).toBe(true);
    expect(store.error()).toBeNull();
    expect(store.isLoading()).toBe(false);
  });

  it('should map a login error and keep the user unauthenticated', () => {
    const loginError = new HttpErrorResponse({
      status: 401,
      error: { message: 'Неверный email или пароль' },
    });

    authApi.login.mockReturnValue(throwError(() => loginError));

    let thrownError: unknown = null;
    store.login(loginBody).subscribe({
      error: (error: unknown) => {
        thrownError = error;
      },
    });

    expect(authApi.login).toHaveBeenCalledWith(loginBody);
    expect(thrownError).toBe(loginError);
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.error()).toBe('Неверный email или пароль');
    expect(store.isLoading()).toBe(false);
  });

  it('should set the current user', () => {
    store.setUser(user);

    expect(store.user()).toEqual(user);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.isSessionResolved()).toBe(true);
    expect(store.error()).toBeNull();
    expect(store.isLoading()).toBe(false);
  });

  it('should clear the session to a resolved guest', () => {
    store.setUser(user);

    store.clear();

    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.isSessionResolved()).toBe(true);
    expect(store.error()).toBeNull();
    expect(store.isLoading()).toBe(false);
  });

  it('should log out and keep a guest session', () => {
    store.setUser(user);
    authApi.logout.mockReturnValue(of({ message: 'Вы вышли из системы' }));

    store.logout();

    expect(authApi.logout).toHaveBeenCalledTimes(1);
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.isSessionResolved()).toBe(true);
    expect(store.error()).toBeNull();
    expect(store.isLoading()).toBe(false);
  });

  it('should keep a guest session when logout fails', () => {
    store.setUser(user);
    authApi.logout.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    store.logout();

    expect(authApi.logout).toHaveBeenCalledTimes(1);
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.isSessionResolved()).toBe(true);
    expect(store.isLoading()).toBe(false);
  });

  it('should keep the stored user when /auth/me fails with a non-401 error', () => {
    store.setUser(user);

    authApi.me.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { message: 'Сервис временно недоступен' },
          }),
      ),
    );

    let isAuthenticated = false;
    store.ensureSession().subscribe((result) => {
      isAuthenticated = result;
    });

    expect(isAuthenticated).toBe(true);
    expect(store.user()).toEqual(user);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.error()).toBe('Сервис временно недоступен');
    expect(store.isLoading()).toBe(false);
  });
});
