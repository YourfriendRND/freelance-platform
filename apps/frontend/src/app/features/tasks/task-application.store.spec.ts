import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { TaskApplicationApi } from '@freelance-platform/client-api';
import { TaskApplicationStore } from '@freelance-platform/client-state';
import {
  createMockTaskApplicationResponse,
  MOCK_TASK_ID,
} from '@freelance-platform/shared-mock';
import {
  CreateTaskApplicationRequest,
  TaskApplicationListResponse,
  TaskApplicationResponse,
} from '@freelance-platform/shared-types';

describe('TaskApplicationStore testing', () => {
  let store: InstanceType<typeof TaskApplicationStore>;
  let taskApplicationApi: {
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };

  const application = createMockTaskApplicationResponse();
  const list: TaskApplicationListResponse = { items: [application] };
  const body: CreateTaskApplicationRequest = {
    taskId: MOCK_TASK_ID,
    message: application.message,
    proposedPrice: 2500,
  };

  beforeEach(() => {
    taskApplicationApi = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        TaskApplicationStore,
        { provide: TaskApplicationApi, useValue: taskApplicationApi },
      ],
    });

    store = TestBed.inject(TaskApplicationStore);
  });

  it('should start with an empty idle state', () => {
    expect(store.applications()).toEqual([]);
    expect(store.duplicateTaskIds()).toEqual([]);
    expect(store.selectedApplication()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.isLoaded()).toBe(false);
    expect(store.isSelectedLoading()).toBe(false);
    expect(store.isSubmitting()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.selectedError()).toBeNull();
    expect(store.submitError()).toBeNull();
    expect(store.hasApplied(MOCK_TASK_ID)).toBe(false);
  });

  it('should load applications', () => {
    taskApplicationApi.findAll.mockReturnValue(of(list));

    store.load();

    expect(store.applications()).toEqual([application]);
    expect(store.isLoading()).toBe(false);
    expect(store.isLoaded()).toBe(true);
    expect(store.hasApplied(MOCK_TASK_ID)).toBe(true);
  });

  it('should keep a single in-flight load', () => {
    const pending = new Subject<TaskApplicationListResponse>();
    taskApplicationApi.findAll.mockReturnValue(pending.asObservable());

    store.load();
    store.load();

    expect(taskApplicationApi.findAll).toHaveBeenCalledTimes(1);

    pending.next(list);
    pending.complete();
  });

  it('should store the load error', () => {
    taskApplicationApi.findAll.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );

    store.load();

    expect(store.error()).toBe('Не удалось загрузить отклики');
    expect(store.isLoaded()).toBe(false);
  });

  it('should append a created application', () => {
    const created: TaskApplicationResponse = createMockTaskApplicationResponse();
    taskApplicationApi.create.mockReturnValue(of(created));

    let result: TaskApplicationResponse | null = null;

    store.create(body).subscribe((response) => {
      result = response;
    });

    expect(result).toEqual(created);
    expect(store.applications()).toEqual([created]);
    expect(store.isSubmitting()).toBe(false);
    expect(store.hasApplied(MOCK_TASK_ID)).toBe(true);
  });

  it('should return conflict exception from duplicate application', () => {
    taskApplicationApi.create.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { message: 'Вы уже откликались на эту задачу' },
          }),
      ),
    );

    store.create(body).subscribe({
      error: () => undefined,
    });

    expect(store.submitError()).toBe('Вы уже откликались на эту задачу');
    expect(store.duplicateTaskIds()).toEqual([MOCK_TASK_ID]);
    expect(store.hasApplied(MOCK_TASK_ID)).toBe(true);
    expect(store.isSubmitting()).toBe(false);
  });

  it('should load one application', () => {
    taskApplicationApi.findOne.mockReturnValue(of(application));

    store.loadById(application.id);

    expect(taskApplicationApi.findOne).toHaveBeenCalledWith(application.id);
    expect(store.selectedApplication()).toEqual(application);
    expect(store.isSelectedLoading()).toBe(false);
    expect(store.selectedError()).toBeNull();
  });

  it('should skip a repeated load of the same application', () => {
    taskApplicationApi.findOne.mockReturnValue(of(application));

    store.loadById(application.id);
    store.loadById(application.id);

    expect(taskApplicationApi.findOne).toHaveBeenCalledTimes(1);
  });

  it('should store a forbidden application error', () => {
    taskApplicationApi.findOne.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 403,
            error: { message: 'Нет доступа к этому отклику' },
          }),
      ),
    );

    store.loadById(application.id);

    expect(store.selectedError()).toBe('Нет доступа к этому отклику');
    expect(store.selectedApplication()).toBeNull();
    expect(store.isSelectedLoading()).toBe(false);
  });

  it('should ignore a stale application response', () => {
    const first = new Subject<TaskApplicationResponse>();
    const second = new Subject<TaskApplicationResponse>();
    const latest = createMockTaskApplicationResponse({
      id: '8d3a1c44-6b20-4e91-9f55-1a2b3c4d5e6f',
    });

    taskApplicationApi.findOne.mockReturnValueOnce(first.asObservable());
    taskApplicationApi.findOne.mockReturnValueOnce(second.asObservable());

    store.loadById(application.id);
    store.loadById(latest.id);

    first.next(application);
    first.complete();

    expect(store.selectedApplication()).toBeNull();
    expect(store.isSelectedLoading()).toBe(true);

    second.next(latest);
    second.complete();

    expect(store.selectedApplication()).toEqual(latest);
  });

  it('should clear the selected application', () => {
    taskApplicationApi.findOne.mockReturnValue(of(application));

    store.loadById(application.id);
    store.clearSelected();

    expect(store.selectedApplication()).toBeNull();
    expect(store.selectedError()).toBeNull();
    expect(store.isSelectedLoading()).toBe(false);
  });
});
