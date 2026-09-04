import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
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
  });

  it('should show analytics for authenticated users', () => {
    authStore.isAuthenticated.set(true);
    fixture.detectChanges();

    expect(root().textContent).toContain('Аналитика');
    expect(root().textContent).toContain('Задачи');
  });

  it('should mark the active item', () => {
    authStore.isAuthenticated.set(true);
    fixture.componentRef.setInput('activeItem', 'analytics');
    fixture.detectChanges();

    const activeItem = root().querySelector('.ui-dashboard-sidebar__item--active');

    expect(activeItem?.textContent).toContain('Аналитика');
  });
});
