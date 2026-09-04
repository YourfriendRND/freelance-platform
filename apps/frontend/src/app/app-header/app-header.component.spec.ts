import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import { UserResponse, UserRole } from '@freelance-platform/shared-types';
import { AppHeaderComponent } from './app-header.component';

describe('AppHeaderComponent testing', () => {
  let fixture: ComponentFixture<AppHeaderComponent>;
  let authStore: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    user: ReturnType<typeof signal<UserResponse | null>>;
    logout: ReturnType<typeof vi.fn>;
  };

  const user: UserResponse = {
    id: 'b7e14a02-91c3-4d58-8a6f-1c2d3e4f5a61',
    email: 'ivan.petrov@example.com',
    firstName: 'Иван',
    lastName: 'Петров',
    role: UserRole.Client,
    createdAt: '2026-08-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    authStore = {
      isAuthenticated: signal(false),
      user: signal<UserResponse | null>(null),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AppHeaderComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppHeaderComponent);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should render guest navigation by default', () => {
    expect(root().textContent).toContain('Войти');
    expect(root().textContent).toContain('Начать');
    expect(root().querySelector('.ui-header__logout')).toBeNull();
  });

  it('should render current user data for an authenticated user', () => {
    authStore.isAuthenticated.set(true);
    authStore.user.set(user);
    fixture.detectChanges();

    expect(root().textContent).toContain('Иван Петров');
    expect(root().textContent).toContain('Заказчик');
  });

  it('should logout and navigate to welcome', () => {
    authStore.isAuthenticated.set(true);
    authStore.user.set(user);
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const logoutButton = root().querySelector('.ui-header__logout') as HTMLButtonElement;
    logoutButton.click();

    expect(authStore.logout).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/welcome']);
  });
});
