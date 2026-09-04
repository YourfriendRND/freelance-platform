import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import { UserResponse, UserRole } from '@freelance-platform/shared-types';
import { AnalyticsPageComponent } from './analytics-page.component';

describe('AnalyticsPageComponent testing', () => {
  let fixture: ComponentFixture<AnalyticsPageComponent>;
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
    createdAt: '2026-09-04T10:00:00.000Z',
  };

  beforeEach(async () => {
    authStore = {
      isAuthenticated: signal(true),
      user: signal<UserResponse | null>(user),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AnalyticsPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsPageComponent);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should render a personalized greeting and create button', () => {
    expect(root().textContent).toContain('С возвращением, Иван Петров!');
    expect(root().textContent).toContain('Вот что происходит с вашими задачами');
    expect(root().textContent).toContain('Новая задача');
  });

  it('should navigate to task create page from the create button', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const createButton = Array.from(root().querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Новая задача',
    );

    createButton?.click();

    expect(navigate).toHaveBeenCalledWith(['/tasks/create']);
  });

  it('should render analytics and tasks sidebar items', () => {
    expect(root().textContent).toContain('Аналитика');
    expect(root().textContent).toContain('Задачи');
  });
});
