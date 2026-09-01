import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { AuthApi } from '@freelance-platform/client-api';
import { AuthStore } from '@freelance-platform/client-state';
import { UserResponse, UserRole } from '@freelance-platform/shared-types';

describe('AuthStore testing', () => {
  let store: InstanceType<typeof AuthStore>;
  let authApi: { me: ReturnType<typeof vi.fn> };

  const user: UserResponse = {
    id: 'b7e14a02-91c3-4d58-8a6f-1c2d3e4f5a61',
    email: 'ivan.petrov@example.com',
    firstName: 'Иван',
    lastName: 'Петров',
    role: UserRole.Client,
    createdAt: '2026-08-01T00:00:00.000Z',
  };

  beforeEach(() => {
    authApi = { me: vi.fn() };

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
    store.ensureSession().subscribe();

    expect(isAuthenticated).toBe(false);
    expect(store.user()).toBeNull();
    expect(store.isSessionResolved()).toBe(true);
    expect(authApi.me).toHaveBeenCalledTimes(1);
  });

  it('should not call /auth/me again after the session is resolved', () => {
    authApi.me.mockReturnValue(of(user));

    store.ensureSession().subscribe();
    store.ensureSession().subscribe();

    expect(authApi.me).toHaveBeenCalledTimes(1);
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
});
