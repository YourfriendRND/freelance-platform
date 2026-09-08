import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import { UserResponse, UserRole } from '@freelance-platform/shared-types';
import { ProfileCardComponent } from '../profile-card/profile-card.component';
import { ProfilePageComponent } from './profile-page.component';

describe('ProfilePageComponent testing', () => {
  let fixture: ComponentFixture<ProfilePageComponent>;
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
      imports: [ProfilePageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePageComponent);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function profileCard(): ProfileCardComponent {
    return fixture.debugElement.query(By.directive(ProfileCardComponent))
      .componentInstance as ProfileCardComponent;
  }

  it('should render dashboard layout with profile navigation active', () => {
    const activeItem = root().querySelector('.ui-dashboard-sidebar__item--active');

    expect(root().querySelector('ui-dashboard-wrapper')).not.toBeNull();
    expect(activeItem?.textContent).toContain('Профиль');
  });

  it('should map current user data to profile card inputs', () => {
    const card = profileCard();

    expect(card.displayName()).toBe('Иван Петров');
    expect(card.email()).toBe('ivan.petrov@example.com');
    expect(card.roleLabel()).toBe('Заказчик');
    expect(card.registrationLabel()).toBe('На платформе с 04.09.2026');
  });

  it('should map fallback values when user data is unavailable', () => {
    authStore.user.set(null);
    fixture.detectChanges();

    const card = profileCard();

    expect(card.displayName()).toBe('Имя не указано');
    expect(card.email()).toBe('Email не указан');
    expect(card.roleLabel()).toBe('Роль не указана');
    expect(card.registrationLabel()).toBe('Дата регистрации не указана');
  });

  it('should map fallback registration date for an invalid value', () => {
    authStore.user.set({
      ...user,
      createdAt: 'invalid-date',
    });
    fixture.detectChanges();

    expect(profileCard().registrationLabel()).toBe(
      'Дата регистрации не указана',
    );
  });
});
