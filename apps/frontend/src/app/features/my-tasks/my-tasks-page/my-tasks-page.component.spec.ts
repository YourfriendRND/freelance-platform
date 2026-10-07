import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TaskApi, TaskCategoryApi } from '@freelance-platform/client-api';
import { AuthStore } from '@freelance-platform/client-state';
import {
  createMockTaskCategoryResponse,
  createMockTaskResponse,
  createMockUserResponse,
  mockClientUserResponse,
} from '@freelance-platform/shared-mock';
import {
  FindTasksQuery,
  TaskSort,
  TaskStatus,
  UserResponse,
} from '@freelance-platform/shared-types';
import { of, Subject, throwError } from 'rxjs';
import { MyTasksPageComponent } from './my-tasks-page.component';

describe('MyTasksPageComponent testing', () => {
  let fixture: ComponentFixture<MyTasksPageComponent>;
  let findAll: ReturnType<typeof vi.fn>;
  let tasks: Subject<{ items: ReturnType<typeof createMockTaskResponse>[] }>;

  const category = createMockTaskCategoryResponse({ title: 'Дизайн и творчество' });
  const ownTask = createMockTaskResponse({
    title: 'Дизайн интернет-магазина',
    categoryId: category.id,
    customerId: mockClientUserResponse.id,
    status: TaskStatus.Open,
  });
  const foreignTask = createMockTaskResponse({
    id: 'f6a7b8c9-d0e1-4234-f567-89abcdef0123',
    title: 'Чужая задача',
    customerId: createMockUserResponse({ id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' }).id,
  });

  beforeEach(async () => {
    tasks = new Subject();
    findAll = vi.fn(() => tasks.asObservable());

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
        { provide: TaskApi, useValue: { findAll } },
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

  function emitTasks(): void {
    tasks.next({ items: [foreignTask, ownTask] });
    tasks.complete();
    fixture.detectChanges();
  }

  it('should load public tasks without a draft status', () => {
    const query = findAll.mock.calls[0][0] as FindTasksQuery;

    expect(query.status).toBeUndefined();
    expect(query.sort).toBe(TaskSort.Newest);
  });

  it('should show only the current user tasks', () => {
    emitTasks();

    const text = root().textContent ?? '';

    expect(text).toContain('Дизайн интернет-магазина');
    expect(text).toContain('Дизайн и творчество');
    expect(text).not.toContain('Чужая задача');
    expect(text).toContain('Показано 1 из 1 задач');
    expect(text).not.toContain('Откликнуться');
  });

  it('should keep draft filtering on the client', async () => {
    emitTasks();
    vi.useFakeTimers();

    const statusSelect = root().querySelector('#tasks-status') as HTMLSelectElement;
    statusSelect.value = TaskStatus.Draft;
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();

    const queries = findAll.mock.calls.map((call) => call[0] as FindTasksQuery);

    expect(queries.every((query) => query.status === undefined)).toBe(true);
    expect(root().textContent).toContain('По заданным фильтрам ничего не найдено');
    expect(root().textContent).not.toContain('Дизайн интернет-магазина');
  });

  it('should render the load error', () => {
    findAll.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    fixture = TestBed.createComponent(MyTasksPageComponent);
    fixture.detectChanges();

    expect(root().textContent).toContain('Не удалось загрузить задачи');
  });
});
