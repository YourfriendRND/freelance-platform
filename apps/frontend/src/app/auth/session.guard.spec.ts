import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { AuthStore } from '@freelance-platform/client-state';
import { sessionGuard, sessionResolveGuard } from './session.guard';

describe('session guards testing', () => {
  let ensureSession: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    ensureSession = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: { ensureSession },
        },
      ],
    });
  });

  function route(): ActivatedRouteSnapshot {
    return {} as ActivatedRouteSnapshot;
  }

  function state(): RouterStateSnapshot {
    return {} as RouterStateSnapshot;
  }

  async function resolveGuardResult(
    result: ReturnType<typeof sessionGuard>,
  ): Promise<unknown> {
    return isObservable(result) ? firstValueFrom(result) : result;
  }

  it('should allow an authenticated user', async () => {
    ensureSession.mockReturnValue(of(true));

    const result = await TestBed.runInInjectionContext(() =>
      resolveGuardResult(sessionGuard(route(), state())),
    );

    expect(result).toBe(true);
    expect(ensureSession).toHaveBeenCalledTimes(1);
  });

  it('should redirect a guest to welcome', async () => {
    ensureSession.mockReturnValue(of(false));

    const result = await TestBed.runInInjectionContext(() =>
      resolveGuardResult(sessionGuard(route(), state())),
    );

    expect(result).toBeInstanceOf(RedirectCommand);
  });

  it('should resolve session data without blocking navigation', async () => {
    ensureSession.mockReturnValue(of(false));

    const result = await TestBed.runInInjectionContext(() =>
      resolveGuardResult(sessionResolveGuard(route(), state())),
    );

    expect(result).toBe(true);
  });

  it('should build a welcome UrlTree for guest redirects', async () => {
    ensureSession.mockReturnValue(of(false));

    const result = await TestBed.runInInjectionContext(() =>
      resolveGuardResult(sessionGuard(route(), state())),
    );

    const router = TestBed.inject(Router);

    expect(result).toBeInstanceOf(RedirectCommand);
    expect(router.serializeUrl((result as RedirectCommand).redirectTo)).toBe(
      '/welcome',
    );
  });
});
