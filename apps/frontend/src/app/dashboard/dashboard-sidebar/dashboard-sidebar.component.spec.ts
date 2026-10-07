import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import { mockClientUserResponse, mockFreelancerUserResponse } from '@freelance-platform/shared-mock';
import { UserResponse } from '@freelance-platform/shared-types';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';

describe('DashboardSidebarComponent testing', () => {
  let fixture: ComponentFixture<DashboardSidebarComponent>;
  let authStore: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    user: ReturnType<typeof signal<UserResponse | null>>;
  };

  beforeEach(async () => {
    authStore = {
      isAuthenticated: signal(false),
      user: signal<UserResponse | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardSidebarComponent],
      providers: [provideRouter([]), { provide: AuthStore, useValue: authStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardSidebarComponent);
    fixture.componentRef.setInput('activeItem', 'tasks');
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should hide analytics for guests', () => {
    expect(root().textContent).toContain('Задачи');
    expect(root().textContent).not.toContain('Аналитика');
    expect(root().textContent).not.toContain('Профиль');
  });

  it('should show protected items for authenticated users', () => {
    authStore.isAuthenticated.set(true);
    fixture.detectChanges();

    expect(root().textContent).toContain('Аналитика');
    expect(root().textContent).toContain('Профиль');
    expect(root().textContent).toContain('Задачи');
    expect(root().textContent).not.toContain('Мои отклики');
    expect(root().textContent).not.toContain('Мои задачи');
  });

  it('should show my applications for a freelancer', () => {
    authStore.isAuthenticated.set(true);
    authStore.user.set(mockFreelancerUserResponse);
    fixture.detectChanges();

    const link = Array.from(root().querySelectorAll('a')).find((item) =>
      item.textContent?.includes('Мои отклики'),
    );

    expect(link?.getAttribute('href')).toBe('/applications');
    expect(root().textContent).not.toContain('Мои задачи');
  });

  it('should hide my applications for a client', () => {
    authStore.isAuthenticated.set(true);
    authStore.user.set(mockClientUserResponse);
    fixture.detectChanges();

    expect(root().textContent).not.toContain('Мои отклики');
  });

  it('should show my tasks for a client', () => {
    authStore.isAuthenticated.set(true);
    authStore.user.set(mockClientUserResponse);
    fixture.detectChanges();

    const link = Array.from(root().querySelectorAll('a')).find((item) =>
      item.textContent?.includes('Мои задачи'),
    );

    expect(link?.getAttribute('href')).toBe('/my-tasks');
  });

  it('should mark the active item', () => {
    authStore.isAuthenticated.set(true);
    fixture.componentRef.setInput('activeItem', 'analytics');
    fixture.detectChanges();

    const activeItem = root().querySelector('.ui-dashboard-sidebar__item--active');

    expect(activeItem?.textContent).toContain('Аналитика');
  });

  it('should mark profile as the active item', () => {
    authStore.isAuthenticated.set(true);
    fixture.componentRef.setInput('activeItem', 'profile');
    fixture.detectChanges();

    const activeItem = root().querySelector('.ui-dashboard-sidebar__item--active');

    expect(activeItem?.textContent).toContain('Профиль');
  });
});
