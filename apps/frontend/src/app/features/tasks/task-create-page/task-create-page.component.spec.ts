import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { TaskCategoryApi } from '@freelance-platform/client-api';
import { AuthStore, TaskStore } from '@freelance-platform/client-state';
import { UserResponse, UserRole } from '@freelance-platform/shared-types';
import { TaskCreateFormComponent } from '../task-create-form/task-create-form.component';
import { TaskCreatePageComponent } from './task-create-page.component';

describe('TaskCreatePageComponent testing', () => {
  let fixture: ComponentFixture<TaskCreatePageComponent>;
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
      isAuthenticated: signal(true),
      user: signal<UserResponse | null>(user),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TaskCreatePageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        { provide: TaskCategoryApi, useValue: { findAll: () => of([]) } },
        { provide: TaskStore, useValue: { create: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCreatePageComponent);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should render the create page shell and form', () => {
    expect(root().textContent).toContain('Новая задача');
    expect(root().textContent).toContain('Назад к аналитике');
    expect(root().querySelector('app-task-create-form')).not.toBeNull();
  });

  it('should navigate to analytics when the form emits cancel', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const form = fixture.debugElement.query(
      By.directive(TaskCreateFormComponent),
    ).componentInstance as TaskCreateFormComponent;

    form.cancel.emit();

    expect(navigate).toHaveBeenCalledWith(['/analytics']);
  });
});
