import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthStore, TaskStore } from '@freelance-platform/client-state';
import {
  TaskCategoryResponse,
  TaskExecutionType,
  TaskResponse,
  TaskStatus,
  UserResponse,
  UserRole,
} from '@freelance-platform/shared-types';
import { TaskDetailsPageComponent } from './task-details-page.component';

describe('TaskDetailsPageComponent testing', () => {
  let fixture: ComponentFixture<TaskDetailsPageComponent>;
  let authStore: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    user: ReturnType<typeof signal<UserResponse | null>>;
    logout: ReturnType<typeof vi.fn>;
  };
  let selectedTask: ReturnType<typeof signal<TaskResponse | null>>;
  let categories: ReturnType<typeof signal<TaskCategoryResponse[]>>;
  let isSelectedLoading: ReturnType<typeof signal<boolean>>;
  let selectedError: ReturnType<typeof signal<string | null>>;
  let loadById: ReturnType<typeof vi.fn>;
  let clearSelected: ReturnType<typeof vi.fn>;

  const category: TaskCategoryResponse = {
    id: '7c2a8e14-5d93-4f1b-9b27-2e5d8c01f102',
    title: 'Программирование и IT',
    description: 'Разработка сайтов, приложений, настройка серверов, консультации',
  };

  const task: TaskResponse = {
    id: '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01',
    title: 'Разработка адаптивного лендинга',
    description: 'Нужен адаптивный лендинг для запуска продукта',
    status: TaskStatus.Open,
    budgetMin: 25000,
    budgetMax: 40000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-09-15',
    customerId: 'b7e14a02-91c3-4d58-8a6f-1c2d3e4f5a61',
    categoryId: category.id,
    createdAt: '2026-08-20T09:00:00.000Z',
    updatedAt: '2026-08-20T09:00:00.000Z',
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
    selectedTask = signal<TaskResponse | null>(null);
    categories = signal<TaskCategoryResponse[]>([]);
    isSelectedLoading = signal(false);
    selectedError = signal<string | null>(null);
    loadById = vi.fn();
    clearSelected = vi.fn();

    const taskStore = {
      selectedTask,
      categories,
      isSelectedLoading,
      selectedError,
      categoryTitleById: () =>
        new Map(categories().map(({ id, title }) => [id, title])),
      loadById,
      clearSelected,
    };

    await TestBed.configureTestingModule({
      imports: [TaskDetailsPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: task.id })),
          },
        },
        { provide: AuthStore, useValue: authStore },
        { provide: TaskStore, useValue: taskStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsPageComponent);
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('should load the task by route id', () => {
    expect(loadById).toHaveBeenCalledWith(task.id);
  });

  it('should render the loading state', () => {
    isSelectedLoading.set(true);
    fixture.detectChanges();

    expect(root().textContent).toContain('Загрузка');
    expect(root().querySelector('app-task-details')).toBeNull();
  });

  it('should render the API error message', () => {
    selectedError.set('Задача не найдена');
    fixture.detectChanges();

    expect(root().textContent).toContain('Задача не найдена');
    expect(root().querySelector('app-task-details')).toBeNull();
  });

  it('should render task details and hide the client block', () => {
    categories.set([category]);
    selectedTask.set(task);
    fixture.detectChanges();

    expect(root().textContent).toContain(task.title);
    expect(root().textContent).toContain('Программирование и IT');
    expect(root().textContent).toContain('Описание');
    expect(root().querySelector('app-task-details-client')).toBeNull();
  });

  it('should fall back to a default category title', () => {
    selectedTask.set({ ...task, categoryId: 'missing-id' });
    fixture.detectChanges();

    expect(root().textContent).toContain('Без категории');
  });

  it('should navigate to welcome on logout', () => {
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

  it('should clear the selected task on destroy', () => {
    fixture.destroy();

    expect(clearSelected).toHaveBeenCalledTimes(1);
  });
});
