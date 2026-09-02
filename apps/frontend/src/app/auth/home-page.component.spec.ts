import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthStore } from '@freelance-platform/client-state';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent testing', () => {
  async function createPage(isAuthenticated: boolean): Promise<{
    fixture: ComponentFixture<HomePageComponent>;
    navigate: ReturnType<typeof vi.spyOn>;
    ensureSession: ReturnType<typeof vi.fn>;
  }> {
    const ensureSession = vi.fn().mockReturnValue(of(isAuthenticated));

    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            ensureSession,
            isAuthenticated: signal(isAuthenticated),
          },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(HomePageComponent);

    fixture.detectChanges();

    return { fixture, navigate, ensureSession };
  }

  it('should navigate a guest to /welcome', async () => {
    const { navigate, ensureSession } = await createPage(false);

    expect(ensureSession).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/welcome'], { replaceUrl: true });
  });

  it('should navigate an authenticated user to /tasks', async () => {
    const { navigate, ensureSession } = await createPage(true);

    expect(ensureSession).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/tasks'], { replaceUrl: true });
  });
});
