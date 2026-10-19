import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { TaskApplicationApi } from '@freelance-platform/client-api';
import { AuthStore, TaskApplicationStore, TaskStore } from '@freelance-platform/client-state';
import {
  createMockTaskApplicationResponse,
  createMockTaskCategoryResponse,
  createMockTaskResponse,
  mockClientUserResponse,
  mockFreelancerUserResponse,
} from '@freelance-platform/shared-mock';
import {
  TaskApplicationResponse,
  TaskApplicationStatus,
  TaskCategoryResponse,
  TaskResponse,
  UserResponse,
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
  let findAll: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;

  const category: TaskCategoryResponse = createMockTaskCategoryResponse();

  const task: TaskResponse = createMockTaskResponse({
    categoryId: category.id,
    applicationsCount: 3,
    viewsCount: 8,
  });

  const user: UserResponse = mockClientUserResponse;

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
    findAll = vi.fn().mockReturnValue(of({ items: [] }));
    update = vi.fn();

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
        { provide: TaskApplicationApi, useValue: { findAll, update } },
        {
          provide: TaskApplicationStore,
          useValue: {
            load: vi.fn(),
            create: vi.fn(),
            hasApplied: () => false,
            clearSubmitError: vi.fn(),
            isSubmitting: signal(false),
            submitError: signal<string | null>(null),
          },
        },
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

  it('should render task details with counts and the client block', () => {
    categories.set([category]);
    selectedTask.set(task);
    fixture.detectChanges();

    expect(root().textContent).toContain(task.title);
    expect(root().textContent).toContain('Программирование и IT');
    expect(root().textContent).toContain('Описание');
    expect(root().textContent).toContain('3 откликов');
    expect(root().textContent).toContain('8 просмотров');
    expect(root().textContent).toContain('Иван Петров');
    expect(root().querySelector('app-task-details-client')).not.toBeNull();
    expect(root().textContent).toContain('Откликнуться на заявку');
    expect(root().querySelector('app-task-details-responses')).toBeNull();
  });

  it('should show the applied state from the task', () => {
    authStore.isAuthenticated.set(true);
    authStore.user.set(mockFreelancerUserResponse);
    selectedTask.set(createMockTaskResponse({ hasApplied: true, categoryId: category.id }));
    fixture.detectChanges();

    expect(root().textContent).toContain('Отклик отправлен');
    expect(root().textContent).not.toContain('Откликнуться на заявку');
    expect(root().querySelector('app-task-details-responses')).toBeNull();
    expect(findAll).not.toHaveBeenCalled();
  });

  it('should hide the apply button for a client', () => {
    authStore.isAuthenticated.set(true);
    authStore.user.set(user);
    categories.set([category]);
    selectedTask.set(task);
    fixture.detectChanges();

    expect(root().textContent).not.toContain('Откликнуться на заявку');
    expect(root().textContent).toContain('Отклики (3)');
    expect(root().querySelector('app-task-details-responses')).not.toBeNull();
    expect(findAll).toHaveBeenCalledWith(task.id);
  });

  it('should show applications loaded for the owned task', () => {
    const application = createMockTaskApplicationResponse({
      taskId: task.id,
      message: 'Готова взяться за задачу',
    });

    findAll.mockReturnValue(of({ items: [application] }));
    authStore.isAuthenticated.set(true);
    authStore.user.set(user);
    selectedTask.set(task);
    fixture.detectChanges();
    fixture.detectChanges();

    const text = (root().textContent ?? '').replace(/\s/g, ' ');

    expect(text).toContain('Готова взяться за задачу');
    expect(text).toContain('2 500 ₽');
    expect(text).toContain('2 недели');
    expect(text).toContain('Принять');
    expect(text).toContain('Отклонить');
  });

  it('should accept an application and show a patch error on the card', () => {
    const application: TaskApplicationResponse = createMockTaskApplicationResponse({
      taskId: task.id,
    });
    const pending = new Subject<TaskApplicationResponse>();

    findAll.mockReturnValue(of({ items: [application] }));
    update.mockReturnValue(pending);
    authStore.isAuthenticated.set(true);
    authStore.user.set(user);
    selectedTask.set(task);
    fixture.detectChanges();
    fixture.detectChanges();

    const acceptButton = Array.from(root().querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Принять'),
    ) as HTMLButtonElement;

    acceptButton.click();
    fixture.detectChanges();

    expect(update).toHaveBeenCalledWith(application.id, {
      status: TaskApplicationStatus.Accept,
    });
    expect(acceptButton.disabled).toBe(true);

    pending.error(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'Уже решено' },
      }),
    );
    fixture.detectChanges();

    expect(root().textContent).toContain('Уже решено');
  });

  it('should decline an application', () => {
    const application = createMockTaskApplicationResponse({ taskId: task.id });

    findAll.mockReturnValue(of({ items: [application] }));
    update.mockReturnValue(
      of({ ...application, status: TaskApplicationStatus.Decline }),
    );
    authStore.isAuthenticated.set(true);
    authStore.user.set(user);
    selectedTask.set(task);
    fixture.detectChanges();
    fixture.detectChanges();

    const declineButton = Array.from(root().querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Отклонить'),
    ) as HTMLButtonElement;

    declineButton.click();
    fixture.detectChanges();

    expect(update).toHaveBeenCalledWith(application.id, {
      status: TaskApplicationStatus.Decline,
    });
    expect(root().textContent).toContain('Отклонён');
    expect(root().textContent).not.toContain('Принять');
    expect(root().textContent).not.toContain('Отклонить');
    expect(root().querySelector('.task-response__status')?.getAttribute('data-status')).toBe(
      'decline',
    );
    expect(root().querySelector('button[disabled]')?.textContent).toContain('Написать');
  });

  it('should accept an application and show the accepted status', () => {
    const application = createMockTaskApplicationResponse({ taskId: task.id });

    findAll.mockReturnValue(of({ items: [application] }));
    update.mockReturnValue(of({ ...application, status: TaskApplicationStatus.Accept }));
    authStore.isAuthenticated.set(true);
    authStore.user.set(user);
    selectedTask.set(task);
    fixture.detectChanges();
    fixture.detectChanges();

    const acceptButton = Array.from(root().querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Принять'),
    ) as HTMLButtonElement;

    acceptButton.click();
    fixture.detectChanges();

    expect(update).toHaveBeenCalledWith(application.id, {
      status: TaskApplicationStatus.Accept,
    });
    expect(root().textContent).toContain('Принят');
    expect(root().textContent).not.toContain('Отклонить');
    expect(root().querySelector('.task-response__status')?.getAttribute('data-status')).toBe(
      'accept',
    );
    expect(root().querySelector('button[disabled]')?.textContent).toContain('Написать');
  });

  it('should open the apply form for a freelancer', () => {
    authStore.isAuthenticated.set(true);
    authStore.user.set(mockFreelancerUserResponse);
    categories.set([category]);
    selectedTask.set(task);
    fixture.detectChanges();

    const applyButton = Array.from(root().querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Откликнуться на заявку'),
    ) as HTMLButtonElement;

    applyButton.click();
    fixture.detectChanges();

    expect(root().textContent).toContain('Откликнуться на эту задачу');
    expect(root().querySelector('app-task-details-apply-form')).not.toBeNull();
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
