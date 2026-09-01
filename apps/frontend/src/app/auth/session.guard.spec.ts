import { TestBed } from '@angular/core/testing';
import { PartialMatchRouteSnapshot, provideRouter } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import { homeRedirect } from './session.guard';

describe('homeRedirect testing', () => {
  function runRedirect(isAuthenticated: boolean): string {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => isAuthenticated,
          },
        },
      ],
    });

    return TestBed.runInInjectionContext(() =>
      homeRedirect({} as PartialMatchRouteSnapshot),
    ) as string;
  }

  it('should redirect a guest to /welcome', () => {
    expect(runRedirect(false)).toBe('/welcome');
  });

  it('should redirect an authenticated user to /tasks', () => {
    expect(runRedirect(true)).toBe('/tasks');
  });
});
