import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore, TaskStore } from '@freelance-platform/client-state';
import {
  createMockTaskCategoryResponse,
  createMockTaskResponse,
  mockClientUserResponse,
} from '@freelance-platform/shared-mock';
import { By } from '@angular/platform-browser';
import {
  FindTasksQuery,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  TaskCategoryResponse,
  TaskResponse,
  TaskSort,
  TaskStatus,
  UserResponse,
} from '@freelance-platform/shared-types';
import { TasksFiltersComponent } from '../tasks-filters/tasks-filters.component';
import { TasksPageComponent } from './tasks-page.component';
import { TASKS_TEST_BUDGET_MAX, TASKS_TEST_BUDGET_MIN } from '../tasks-test.constants';

describe('TasksPageComponent testing', () => {
  let fixture: ComponentFixture<TasksPageComponent>;
  let authStore: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    user: ReturnType<typeof signal<UserResponse | null>>;
    logout: ReturnType<typeof vi.fn>;
  };
  let tasks: ReturnType<typeof signal<TaskResponse[]>>;
  let categories: ReturnType<typeof signal<TaskCategoryResponse[]>>;
  let isLoading: ReturnType<typeof signal<boolean>>;
  let error: ReturnType<typeof signal<string | null>>;
  let total: ReturnType<typeof signal<number>>;
  let load: ReturnType<typeof vi.fn>;
  let listQuery: ReturnType<typeof signal<FindTasksQuery>>;

  const category: TaskCategoryResponse = createMockTaskCategoryResponse();

  function createTask(
    id: string,
    title: string,
    categoryId = category.id,
  ): TaskResponse {
    return createMockTaskResponse({
      id,
      title,
      description: 'Описание задачи',
      budgetMin: TASKS_TEST_BUDGET_MIN,
      budgetMax: TASKS_TEST_BUDGET_MAX,
      categoryId,
    });
  }

  beforeEach(async () => {
    authStore = {
      isAuthenticated: signal(false),
      user: signal<UserResponse | null>(null),
      logout: vi.fn(),
    };
    tasks = signal<TaskResponse[]>([]);
    categories = signal<TaskCategoryResponse[]>([]);
    isLoading = signal(false);
    error = signal<string | null>(null);
    total = signal(0);
    listQuery = signal<FindTasksQuery>({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
    });
    load = vi.fn();

    const taskStore = {
      tasks,
      categories,
      isLoading,
      error,
      total,
      listQuery,
      page: computed(() => listQuery().page ?? PAGINATION_DEFAULT_PAGE),
      limit: computed(() => listQuery().limit ?? PAGINATION_DEFAULT_LIMIT),
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

  it('should load tasks on init', () => {
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

  it('should render a filtered empty state from the server total', () => {
    listQuery.set({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      categoryId: category.id,
    });
    total.set(0);
    fixture.detectChanges();

    expect(root().textContent).toContain('По заданным фильтрам ничего не найдено');
    expect(root().textContent).not.toContain('Список задач пуст');
    expect(root().querySelector('app-task-item')).toBeNull();
  });

  it('should render the API error message', () => {
    error.set('Сервис недоступен');
    fixture.detectChanges();

    expect(root().textContent).toContain('Сервис недоступен');
    expect(root().textContent).not.toContain('Список задач пуст');
  });

  it('should render all loaded tasks with category titles', () => {
    const loadedTasks = [
      createTask('e16523f1-0be9-41bd-b3cb-0e8360ce967f', 'Первая задача'),
      createTask('147c24c3-eb5d-4f6b-adc0-670a7835fdf2', 'Вторая задача'),
      createTask('0e00f3ff-858a-472d-b6d6-a2bfcfcd1cda', 'Третья задача'),
      createTask('b8262e40-cf3d-4d15-8da6-ce9388b7f949', 'Четвёртая задача'),
    ];

    categories.set([category]);
    tasks.set(loadedTasks);
    const availableTotal = 24;
    total.set(availableTotal);
    fixture.detectChanges();

    expect(root().querySelectorAll('app-task-item')).toHaveLength(loadedTasks.length);
    expect(root().textContent).toContain('Первая задача');
    expect(root().textContent).toContain('Четвёртая задача');
    expect(root().textContent).toContain('Программирование и IT');
    expect(root().textContent).toContain(
      `Найдите подходящую задачу среди ${availableTotal} доступных`,
    );
    expect(root().textContent).toContain(
      `Показано ${loadedTasks.length} из ${availableTotal} задач`,
    );
    expect(root().querySelector('app-tasks-pagination')).not.toBeNull();
    expect(root().textContent).not.toContain('Черновик');
  });

  it('should request the next page from the store', () => {
    categories.set([category]);
    tasks.set([
      createTask('e16523f1-0be9-41bd-b3cb-0e8360ce967f', 'Первая задача'),
    ]);
    total.set(21);
    listQuery.set({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
    });
    fixture.detectChanges();

    const nextPageButton = Array.from(root().querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === '2',
    );

    nextPageButton?.click();
    fixture.detectChanges();

    expect(load).toHaveBeenCalledWith({
      page: 2,
      limit: PAGINATION_DEFAULT_LIMIT,
    });
  });

  it('should request a filtered list from the first page', () => {
    categories.set([category]);
    tasks.set([
      createTask('e16523f1-0be9-41bd-b3cb-0e8360ce967f', 'Первая задача'),
    ]);
    total.set(21);
    listQuery.set({
      page: 2,
      limit: PAGINATION_DEFAULT_LIMIT,
    });
    fixture.detectChanges();

    const filters = fixture.debugElement.query(
      By.directive(TasksFiltersComponent),
    ).componentInstance as TasksFiltersComponent;

    filters.filtersChange.emit({
      categoryId: category.id,
      status: TaskStatus.Open,
      budgetMin: TASKS_TEST_BUDGET_MIN,
      budgetMax: TASKS_TEST_BUDGET_MAX,
      sort: TaskSort.Oldest,
    });

    expect(load).toHaveBeenCalledWith({
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
      categoryId: category.id,
      status: TaskStatus.Open,
      budgetMin: TASKS_TEST_BUDGET_MIN,
      budgetMax: TASKS_TEST_BUDGET_MAX,
      sort: TaskSort.Oldest,
    });
  });

  it('should fall back to a default category title', () => {
    tasks.set([createTask('e16523f1-0be9-41bd-b3cb-0e8360ce967f', 'Задача без категории', 'missing-id')]);
    total.set(1);
    fixture.detectChanges();

    expect(root().textContent).toContain('Без категории');
  });

  it('should navigate to welcome on logout', () => {
    authStore.isAuthenticated.set(true);
    authStore.user.set(mockClientUserResponse);
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const logoutButton = root().querySelector('.ui-header__logout') as HTMLButtonElement;
    logoutButton.click();

    expect(authStore.logout).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/welcome']);
  });
});
