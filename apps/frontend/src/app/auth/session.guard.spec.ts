import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AuthStore } from '@freelance-platform/client-state';
import { homeGuard } from './session.guard';

describe('homeGuard testing', () => {
  async function runGuard(isAuthenticated: boolean): Promise<string> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            ensureSession: () => of(isAuthenticated),
          },
        },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      homeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Observable<UrlTree>;

    const urlTree = await firstValueFrom(result);
    const router = TestBed.inject(Router);

    return router.serializeUrl(urlTree);
  }

  it('should redirect a guest to /welcome', async () => {
    expect(await runGuard(false)).toBe('/welcome');
  });

  it('should redirect an authenticated user to /tasks', async () => {
    expect(await runGuard(true)).toBe('/tasks');
  });
});
