import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
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
import { Observable, of, Subject, throwError } from 'rxjs';
import { TasksFiltersComponent } from '../../tasks/tasks-filters/tasks-filters.component';
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

  it('should send draft status to the backend and write it with replaceUrl', async () => {
    emitTasks();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    const filters = fixture.debugElement.query(By.directive(TasksFiltersComponent))
      .componentInstance as TasksFiltersComponent;

    filters.filtersChange.emit({
      status: TaskStatus.Draft,
      sort: TaskSort.Newest,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const [lastCall] = findMine.mock.calls.slice(-1);
    const [query] = lastCall as [FindMyTasksQuery];

    expect(query.status).toBe(TaskStatus.Draft);
    expect(query.page).toBe(PAGINATION_DEFAULT_PAGE);
    expect(query).not.toHaveProperty('search');
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        replaceUrl: true,
        queryParams: { status: TaskStatus.Draft },
      }),
    );
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

  it('should request the next page and keep it in the address', async () => {
    emitTasks(createMockTaskListResponse({ items: [ownTask], total: 21 }));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');

    const next = Array.from(root().querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Вперёд'),
    );

    next?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const [lastCall] = findMine.mock.calls.slice(-1);
    const [query] = lastCall as [FindMyTasksQuery];

    expect(query.page).toBe(2);
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        replaceUrl: true,
        queryParams: { page: '2' },
      }),
    );
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

describe('MyTasksPageComponent address', () => {
  it('should load draft and page from the address without search', async () => {
    const category = createMockTaskCategoryResponse();
    const findMine = vi.fn<(query: FindMyTasksQuery) => Observable<TaskListResponse>>(() =>
      of(createMockTaskListResponse({ items: [], total: 0 })),
    );

    await TestBed.configureTestingModule({
      imports: [MyTasksPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(
              convertToParamMap({
                status: TaskStatus.Draft,
                page: '2',
                search: 'логотип',
              }),
            ),
          },
        },
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

    const fixture = TestBed.createComponent(MyTasksPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const query = findMine.mock.calls[0]?.[0];
    const root = fixture.nativeElement as HTMLElement;

    expect(query).toEqual({
      page: 2,
      limit: PAGINATION_DEFAULT_LIMIT,
      status: TaskStatus.Draft,
      sort: TaskSort.Newest,
    });
    expect(query).not.toHaveProperty('search');
    expect(root.querySelector<HTMLInputElement>('#tasks-search')?.value).toBe('логотип');
    expect(root.querySelector<HTMLSelectElement>('#tasks-status')?.value).toBe(TaskStatus.Draft);
  });
});
