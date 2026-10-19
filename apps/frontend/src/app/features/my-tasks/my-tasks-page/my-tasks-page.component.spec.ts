import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TaskApi, TaskCategoryApi } from '@freelance-platform/client-api';
import { AuthStore } from '@freelance-platform/client-state';
import {
  createMockTaskCategoryResponse,
  createMockTaskListResponse,
  createMockTaskResponse,
  mockClientUserResponse,
} from '@freelance-platform/shared-mock';
import {
  FindMyTasksQuery,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  TaskListResponse,
  TaskSort,
  TaskStatus,
  UserResponse,
} from '@freelance-platform/shared-types';
import { of, Subject, throwError } from 'rxjs';
import { MyTasksPageComponent } from './my-tasks-page.component';

describe('MyTasksPageComponent testing', () => {
  let fixture: ComponentFixture<MyTasksPageComponent>;
  let findMine: ReturnType<typeof vi.fn>;
  let tasks: Subject<TaskListResponse>;

  const category = createMockTaskCategoryResponse({ title: 'Дизайн и творчество' });
  const ownTask = createMockTaskResponse({
    title: 'Дизайн интернет-магазина',
    categoryId: category.id,
    customerId: mockClientUserResponse.id,
    status: TaskStatus.Open,
    applicationsCount: 2,
    viewsCount: 5,
  });

  beforeEach(async () => {
    tasks = new Subject();
    findMine = vi.fn(() => tasks.asObservable());

    await TestBed.configureTestingModule({
      imports: [MyTasksPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: signal(true),
            user: signal<UserResponse | null>(mockClientUserResponse),
            logout: vi.fn(),
          },
        },
        { provide: TaskApi, useValue: { findMine } },
        {
          provide: TaskCategoryApi,
          useValue: { findAll: () => of([category]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyTasksPageComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function root(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function emitTasks(response: TaskListResponse = createMockTaskListResponse({
    items: [ownTask],
    total: 1,
  })): void {
    tasks.next(response);
    fixture.detectChanges();
  }

  it('should load own tasks without a draft status', () => {
    const [firstCall] = findMine.mock.calls;
    const [query] = firstCall as [FindMyTasksQuery];

    expect(query.status).toBeUndefined();
    expect(query.sort).toBe(TaskSort.Newest);
    expect(query.page).toBe(PAGINATION_DEFAULT_PAGE);
    expect(query.limit).toBe(PAGINATION_DEFAULT_LIMIT);
    expect(query).not.toHaveProperty('customerId');
  });

  it('should render a task returned by the server without a customer filter', () => {
    const foreignTask = createMockTaskResponse({
      title: 'Чужая задача',
      categoryId: category.id,
      customerId: 'foreign-customer-id',
    });

    emitTasks(createMockTaskListResponse({ items: [foreignTask], total: 1 }));

    expect(root().textContent).toContain('Чужая задача');
  });

  it('should show tasks from the response', () => {
    emitTasks(createMockTaskListResponse({ items: [ownTask], total: 3 }));

    const text = root().textContent ?? '';

    expect(text).toContain('Дизайн интернет-магазина');
    expect(text).toContain('Дизайн и творчество');
    expect(text).toContain('2 откликов');
    expect(text).toContain('5 просмотров');
    expect(text).toContain('Иван Петров');
    expect(text).toContain('Показано 1 из 3 задач');
    expect(text).not.toContain('Откликнуться');
  });

  it('should send draft status to the backend', async () => {
    emitTasks();
    vi.useFakeTimers();

    const statusSelect = root().querySelector('#tasks-status') as HTMLSelectElement;
    statusSelect.value = TaskStatus.Draft;
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();

    const [lastCall] = findMine.mock.calls.slice(-1);
    const [query] = lastCall as [FindMyTasksQuery];

    expect(query.status).toBe(TaskStatus.Draft);
    expect(query.page).toBe(PAGINATION_DEFAULT_PAGE);
  });

  it('should ignore search without a new request', async () => {
    emitTasks();
    vi.useFakeTimers();

    const search = root().querySelector('#tasks-search') as HTMLInputElement;
    search.value = 'магазин';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();

    expect(findMine).toHaveBeenCalledTimes(1);
    expect(root().textContent).toContain('Дизайн интернет-магазина');
  });

  it('should request the next page', () => {
    emitTasks(createMockTaskListResponse({ items: [ownTask], total: 21 }));

    const next = Array.from(root().querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Вперёд'),
    );

    next?.click();
    fixture.detectChanges();

    const [lastCall] = findMine.mock.calls.slice(-1);
    const [query] = lastCall as [FindMyTasksQuery];

    expect(query.page).toBe(2);
  });

  it('should render the load error', () => {
    findMine.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    fixture = TestBed.createComponent(MyTasksPageComponent);
    fixture.detectChanges();

    expect(root().textContent).toContain('Не удалось загрузить задачи');
  });
});
