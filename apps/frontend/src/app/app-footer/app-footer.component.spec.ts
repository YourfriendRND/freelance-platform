import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import {
  mockClientUserResponse,
  mockFreelancerUserResponse,
} from '@freelance-platform/shared-mock';
import { UserResponse } from '@freelance-platform/shared-types';
import { UiFooterText } from '@freelance-platform/ui';
import { AppFooterComponent } from './app-footer.component';

describe('AppFooterComponent testing', () => {
  let fixture: ComponentFixture<AppFooterComponent>;
  let authStore: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    user: ReturnType<typeof signal<UserResponse | null>>;
  };

  const client: UserResponse = mockClientUserResponse;

  const freelancer: UserResponse = mockFreelancerUserResponse;

  beforeEach(async () => {
    authStore = {
      isAuthenticated: signal(false),
      user: signal<UserResponse | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [AppFooterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFooterComponent);
    fixture.detectChanges();
  });

  function clickFooterLink(label: string): void {
    const links = fixture.nativeElement.querySelectorAll('.ui-footer__link');
    const link = [...links].find(
      (element) => element.textContent?.trim() === label,
    ) as HTMLAnchorElement | undefined;

    if (!link) {
      throw new Error(`Footer link not found: ${label}`);
    }

    link.click();
  }

  function clickPostTaskLink(): void {
    clickFooterLink(UiFooterText.PostTask);
  }

  it('should navigate a guest to login from post task link', () => {
    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    clickPostTaskLink();

    expect(navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should navigate a client to task create from post task link', () => {
    authStore.isAuthenticated.set(true);
    authStore.user.set(client);
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    clickPostTaskLink();

    expect(navigateByUrl).toHaveBeenCalledWith('/tasks/create');
  });

  it('should navigate a freelancer to analytics from post task link', () => {
    authStore.isAuthenticated.set(true);
    authStore.user.set(freelancer);
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    clickPostTaskLink();

    expect(navigateByUrl).toHaveBeenCalledWith('/analytics');
  });

  it('should navigate to register from sign up link for a guest', () => {
    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    clickFooterLink(UiFooterText.SignUp);

    expect(navigateByUrl).toHaveBeenCalledWith('/register');
  });

  it('should navigate to tasks from sign up link for an authenticated user', () => {
    authStore.isAuthenticated.set(true);
    authStore.user.set(client);
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    clickFooterLink(UiFooterText.SignUp);

    expect(navigateByUrl).toHaveBeenCalledWith('/tasks');
  });
});
