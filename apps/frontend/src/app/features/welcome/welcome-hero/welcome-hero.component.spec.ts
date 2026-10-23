import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import { createMockUserResponse, mockFreelancerUserResponse } from '@freelance-platform/shared-mock';
import { UserResponse, UserRole } from '@freelance-platform/shared-types';
import { of } from 'rxjs';
import { WelcomeHeroComponent } from './welcome-hero.component';

describe('WelcomeHeroComponent testing', () => {
  let fixture: ComponentFixture<WelcomeHeroComponent>;

  async function setup(options: {
    user: UserResponse | null;
    sessionResolved: boolean;
  }): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [WelcomeHeroComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            user: signal(options.user),
            isSessionResolved: signal(options.sessionResolved),
            ensureSession: vi.fn().mockReturnValue(of(options.user !== null)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeHeroComponent);
    fixture.detectChanges();
  }

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function getButtonLabels(): string[] {
    return Array.from(root().querySelectorAll('button')).map(
      (button) => button.textContent?.trim() ?? '',
    );
  }

  it('should hide actions until the session is resolved', async () => {
    await setup({ user: null, sessionResolved: false });

    expect(root().textContent).toContain('Найдите идеального исполнителя для следующего проекта');
    expect(root().querySelector('img')?.getAttribute('src')).toBe('/images/welcome-hero.jpg');
    expect(getButtonLabels()).toEqual([]);
  });

  it('should show both guest actions', async () => {
    await setup({ user: null, sessionResolved: true });

    expect(getButtonLabels()).toEqual(['Опубликовать задачу', 'Найти работу']);
  });

  it('should open registration from the guest publish action', async () => {
    await setup({ user: null, sessionResolved: true });
    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    root().querySelector('button')?.click();

    expect(navigateByUrl).toHaveBeenCalledWith('/register');
  });

  it('should open the task list from the guest find-work action', async () => {
    await setup({ user: null, sessionResolved: true });
    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const findWork = Array.from(root().querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Найти работу',
    );

    findWork?.click();

    expect(navigateByUrl).toHaveBeenCalledWith('/tasks');
  });

  it('should show only find work to a freelancer', async () => {
    await setup({
      user: createMockUserResponse({
        ...mockFreelancerUserResponse,
        role: UserRole.Freelancer,
      }),
      sessionResolved: true,
    });
    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    expect(getButtonLabels()).toEqual(['Найти работу']);

    root().querySelector('button')?.click();

    expect(navigateByUrl).toHaveBeenCalledWith('/tasks');
  });

  it('should show only publish task to a customer', async () => {
    await setup({
      user: createMockUserResponse({ role: UserRole.Client }),
      sessionResolved: true,
    });
    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    expect(getButtonLabels()).toEqual(['Опубликовать задачу']);

    root().querySelector('button')?.click();

    expect(navigateByUrl).toHaveBeenCalledWith('/tasks/create');
  });
});
