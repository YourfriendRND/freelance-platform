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
import { guestGuard } from './guest.guard';

describe('guestGuard testing', () => {
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
    result: ReturnType<typeof guestGuard>,
  ): Promise<unknown> {
    return isObservable(result) ? firstValueFrom(result) : result;
  }

  it('should allow a guest', async () => {
    ensureSession.mockReturnValue(of(false));

    const result = await TestBed.runInInjectionContext(() =>
      resolveGuardResult(guestGuard(route(), state())),
    );

    expect(result).toBe(true);
    expect(ensureSession).toHaveBeenCalledTimes(1);
  });

  it('should redirect an authenticated user to tasks', async () => {
    ensureSession.mockReturnValue(of(true));

    const result = await TestBed.runInInjectionContext(() =>
      resolveGuardResult(guestGuard(route(), state())),
    );

    const router = TestBed.inject(Router);

    expect(result).toBeInstanceOf(RedirectCommand);
    expect(router.serializeUrl((result as RedirectCommand).redirectTo)).toBe(
      '/tasks',
    );
  });
});
