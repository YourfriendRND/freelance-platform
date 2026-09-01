import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore, TaskStore } from '@freelance-platform/client-state';
import {
  TaskCategoryResponse,
  TaskExecutionType,
  TaskResponse,
  TaskStatus,
  UserResponse,
  UserRole,
} from '@freelance-platform/shared-types';
import { TasksPageComponent } from './tasks-page.component';

describe('TasksPageComponent testing', () => {
  let fixture: ComponentFixture<TasksPageComponent>;
  let authStore: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    user: ReturnType<typeof signal<UserResponse | null>>;
    bootstrap: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let tasks: ReturnType<typeof signal<TaskResponse[]>>;
  let categories: ReturnType<typeof signal<TaskCategoryResponse[]>>;
  let isLoading: ReturnType<typeof signal<boolean>>;
  let error: ReturnType<typeof signal<string | null>>;
  let load: ReturnType<typeof vi.fn>;

  const category: TaskCategoryResponse = {
    id: '7c2a8e14-5d93-4f1b-9b27-2e5d8c01f102',
    title: 'Программирование и IT',
    description: 'Разработка сайтов, приложений, настройка серверов, консультации',
  };

  function createTask(
    id: string,
    title: string,
    categoryId = category.id,
  ): TaskResponse {
    return {
      id,
      title,
      description: 'Описание задачи',
      status: TaskStatus.Open,
      budgetMin: 10000,
      budgetMax: 20000,
      executionType: TaskExecutionType.Remote,
      deadline: '2026-09-15',
      customerId: 'b7e14a02-91c3-4d58-8a6f-1c2d3e4f5a61',
      categoryId,
      createdAt: '2026-08-20T09:00:00.000Z',
      updatedAt: '2026-08-20T09:00:00.000Z',
    };
  }

  beforeEach(async () => {
    authStore = {
      isAuthenticated: signal(false),
      user: signal<UserResponse | null>(null),
      bootstrap: vi.fn(),
      logout: vi.fn(),
    };
    tasks = signal<TaskResponse[]>([]);
    categories = signal<TaskCategoryResponse[]>([]);
    isLoading = signal(false);
    error = signal<string | null>(null);
    load = vi.fn();

    const taskStore = {
      tasks,
      categories,
      isLoading,
      error,
      categoryTitleById: () =>
        new Map(categories().map(({ id, title }) => [id, title])),
      load,
    };

    await TestBed.configureTestingModule({
      imports: [TasksPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        { provide: TaskStore, useValue: taskStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksPageComponent);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should bootstrap auth and load tasks on init', () => {
    expect(authStore.bootstrap).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('should render the loading state', () => {
    isLoading.set(true);
    fixture.detectChanges();

    expect(root().textContent).toContain('Загрузка');
    expect(root().textContent).not.toContain('Список задач пуст');
  });

  it('should render the empty state', () => {
    expect(root().textContent).toContain('Список задач пуст');
    expect(root().querySelector('app-task-item')).toBeNull();
  });

  it('should render the API error message', () => {
    error.set('Сервис недоступен');
    fixture.detectChanges();

    expect(root().textContent).toContain('Сервис недоступен');
    expect(root().textContent).not.toContain('Список задач пуст');
  });

  it('should render a page of tasks with category titles', () => {
    categories.set([category]);
    tasks.set([
      createTask('e16523f1-0be9-41bd-b3cb-0e8360ce967f', 'Первая задача'),
      createTask('147c24c3-eb5d-4f6b-adc0-670a7835fdf2', 'Вторая задача'),
      createTask('0e00f3ff-858a-472d-b6d6-a2bfcfcd1cda', 'Третья задача'),
      createTask('b8262e40-cf3d-4d15-8da6-ce9388b7f949', 'Четвёртая задача'),
    ]);
    fixture.detectChanges();

    expect(root().textContent).toContain('Первая задача');
    expect(root().textContent).toContain('Вторая задача');
    expect(root().textContent).toContain('Третья задача');
    expect(root().textContent).not.toContain('Четвёртая задача');
    expect(root().textContent).toContain('Программирование и IT');
    expect(root().textContent).toContain('Найдите подходящую задачу среди 4 доступных');
  });

  it('should fall back to a default category title', () => {
    tasks.set([createTask('e16523f1-0be9-41bd-b3cb-0e8360ce967f', 'Задача без категории', 'missing-id')]);
    fixture.detectChanges();

    expect(root().textContent).toContain('Без категории');
  });

  it('should switch to the next page of tasks', () => {
    categories.set([category]);
    tasks.set([
      createTask('e16523f1-0be9-41bd-b3cb-0e8360ce967f', 'Первая задача'),
      createTask('147c24c3-eb5d-4f6b-adc0-670a7835fdf2', 'Вторая задача'),
      createTask('0e00f3ff-858a-472d-b6d6-a2bfcfcd1cda', 'Третья задача'),
      createTask('b8262e40-cf3d-4d15-8da6-ce9388b7f949', 'Четвёртая задача'),
    ]);
    fixture.detectChanges();

    const nextPageButton = Array.from(root().querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === '2',
    );

    nextPageButton?.click();
    fixture.detectChanges();

    expect(root().textContent).not.toContain('Первая задача');
    expect(root().textContent).toContain('Четвёртая задача');
  });

  it('should navigate to welcome on logout', () => {
    const user: UserResponse = {
      id: 'b7e14a02-91c3-4d58-8a6f-1c2d3e4f5a61',
      email: 'ivan.petrov@example.com',
      firstName: 'Иван',
      lastName: 'Петров',
      role: UserRole.Client,
      createdAt: '2026-08-01T00:00:00.000Z',
    };

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
