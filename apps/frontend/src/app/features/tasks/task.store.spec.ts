import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { TaskApi, TaskCategoryApi } from '@freelance-platform/client-api';
import { TaskStore } from '@freelance-platform/client-state';
import {
  TaskCategoryResponse,
  TaskExecutionType,
  TaskResponse,
  TaskStatus,
} from '@freelance-platform/shared-types';

describe('TaskStore testing', () => {
  let store: InstanceType<typeof TaskStore>;
  let taskApi: { findAll: ReturnType<typeof vi.fn>; findOne: ReturnType<typeof vi.fn> };
  let taskCategoryApi: { findAll: ReturnType<typeof vi.fn> };

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

  beforeEach(() => {
    taskApi = { findAll: vi.fn(), findOne: vi.fn() };
    taskCategoryApi = { findAll: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        TaskStore,
        { provide: TaskApi, useValue: taskApi },
        { provide: TaskCategoryApi, useValue: taskCategoryApi },
      ],
    });

    store = TestBed.inject(TaskStore);
  });

  it('should start with an empty idle state', () => {
    expect(store.tasks()).toEqual([]);
    expect(store.categories()).toEqual([]);
    expect(store.selectedTask()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.isSelectedLoading()).toBe(false);
    expect(store.isListLoaded()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.selectedError()).toBeNull();
  });

  it('should load tasks and categories together', () => {
    taskApi.findAll.mockReturnValue(of([task]));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load();

    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.tasks()).toEqual([task]);
    expect(store.categories()).toEqual([category]);
    expect(store.categoryTitleById().get(category.id)).toBe(category.title);
  });

  it('should keep a single in-flight request', () => {
    const tasks = new Subject<TaskResponse[]>();
    taskApi.findAll.mockReturnValue(tasks.asObservable());
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load();
    store.load();

    expect(taskApi.findAll).toHaveBeenCalledTimes(1);
    expect(taskCategoryApi.findAll).toHaveBeenCalledTimes(1);
    expect(store.isLoading()).toBe(true);

    tasks.next([task]);
    tasks.complete();

    expect(store.isLoading()).toBe(false);
    expect(store.tasks()).toEqual([task]);
  });

  it('should store the API error message when loading fails', () => {
    taskApi.findAll.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: { message: 'Сервис недоступен' },
          }),
      ),
    );
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load();

    expect(store.isLoading()).toBe(false);
    expect(store.tasks()).toEqual([]);
    expect(store.error()).toBe('Сервис недоступен');
  });

  it('should fall back to a default error message', () => {
    taskApi.findAll.mockReturnValue(of([task]));
    taskCategoryApi.findAll.mockReturnValue(throwError(() => new Error('network')));

    store.load();

    expect(store.error()).toBe('Не удалось загрузить задачи');
    expect(store.isLoading()).toBe(false);
  });

  it('should not reload the list after a successful load', () => {
    taskApi.findAll.mockReturnValue(of([task]));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.load();
    store.load();

    expect(taskApi.findAll).toHaveBeenCalledTimes(1);
    expect(taskCategoryApi.findAll).toHaveBeenCalledTimes(1);
    expect(store.isListLoaded()).toBe(true);
  });

  it('should load a task by id with categories', () => {
    taskApi.findOne.mockReturnValue(of(task));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.loadById(task.id);

    expect(store.isSelectedLoading()).toBe(false);
    expect(store.selectedError()).toBeNull();
    expect(store.selectedTask()).toEqual(task);
    expect(store.categories()).toEqual([category]);
  });

  it('should keep a single in-flight loadById request', () => {
    const selectedTask = new Subject<TaskResponse>();
    taskApi.findOne.mockReturnValue(selectedTask.asObservable());
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.loadById(task.id);
    store.loadById(task.id);

    expect(taskApi.findOne).toHaveBeenCalledTimes(1);
    expect(store.isSelectedLoading()).toBe(true);

    selectedTask.next(task);
    selectedTask.complete();

    expect(store.isSelectedLoading()).toBe(false);
    expect(store.selectedTask()).toEqual(task);
  });

  it('should not refetch categories when they are already loaded', () => {
    taskApi.findOne.mockReturnValue(of(task));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.loadById(task.id);
    store.clearSelected();
    store.loadById(task.id);

    expect(taskApi.findOne).toHaveBeenCalledTimes(2);
    expect(taskCategoryApi.findAll).toHaveBeenCalledTimes(1);
  });

  it('should store the API error message when loadById fails', () => {
    taskApi.findOne.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 404,
            error: { message: 'Задача с "5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01" не найдена' },
          }),
      ),
    );
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.loadById(task.id);

    expect(store.isSelectedLoading()).toBe(false);
    expect(store.selectedTask()).toBeNull();
    expect(store.selectedError()).toBe(
      'Задача с "5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01" не найдена',
    );
  });

  it('should fall back to a default error message when loadById fails', () => {
    taskApi.findOne.mockReturnValue(throwError(() => new Error('network')));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.loadById(task.id);

    expect(store.selectedError()).toBe('Не удалось загрузить задачу');
    expect(store.isSelectedLoading()).toBe(false);
  });

  it('should clear the selected task', () => {
    taskApi.findOne.mockReturnValue(of(task));
    taskCategoryApi.findAll.mockReturnValue(of([category]));

    store.loadById(task.id);
    store.clearSelected();

    expect(store.selectedTask()).toBeNull();
    expect(store.isSelectedLoading()).toBe(false);
    expect(store.selectedError()).toBeNull();
    expect(store.categories()).toEqual([category]);
  });
});
