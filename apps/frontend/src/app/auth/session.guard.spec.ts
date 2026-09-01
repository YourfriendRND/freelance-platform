import { TestBed } from '@angular/core/testing';
import { PartialMatchRouteSnapshot, provideRouter } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AuthStore } from '@freelance-platform/client-state';
import { homeRedirect } from './session.guard';

describe('homeRedirect testing', () => {
  async function runRedirect(isAuthenticated: boolean): Promise<string> {
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
      homeRedirect({} as PartialMatchRouteSnapshot),
    );

    return firstValueFrom(result as Observable<string>);
  }

  it('should redirect a guest to /welcome', async () => {
    expect(await runRedirect(false)).toBe('/welcome');
  });

  it('should redirect an authenticated user to /tasks', async () => {
    expect(await runRedirect(true)).toBe('/tasks');
  });
});
